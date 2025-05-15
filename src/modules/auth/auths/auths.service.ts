/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
//import { UsersService } from '../../users/users.service';
import { NotificationService } from '../../notifications/notifications.service';
import { 
  hashPassword, 
  comparePasswords, 
  generateVerificationToken, 
  generateResetToken,
  getVerificationTokenExpiry,
  getResetTokenExpiry
} from '../../utils/auth.utils';
import { RegisterInput } from '../auths/dto/signup.dto';
import { LoginInput } from '../auths/dto/login.dto';
import { RefreshTokenInput } from '../auths/dto/refresh-token.dto';
import { VerifyEmailInput } from '../auths/dto/verify-email.dto';
import { RequestPasswordResetInput } from '../auths/dto/request-passwor-reset.dto';
import { ResetPasswordInput } from '../auths/dto/reset-password.dto';
import { SocialLoginInput } from '../auths/dto/oauth.dto';
import { User } from '../../users/models/user.model';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { SafeUser } from '../../users/types/safe-user.type';



@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private jwtSecretKey: string;
  private jwtRefreshSecretKey: string;
  private jwtExpiresIn: string;
  private jwtRefreshExpiresIn: string;

  constructor(
    private prisma: PrismaService,
    //private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
    this.jwtSecretKey = this.configService.get<string>('JWT_SECRET');
    this.jwtRefreshSecretKey = this.configService.get<string>('JWT_REFRESH_SECRET');
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRATION', '15m');
    this.jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
  }

  /**
   * Register a new user with email and password
   */
  async register(registerInput: RegisterInput): Promise<SafeUser> {
    const { email, password, fullName } = registerInput;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = getVerificationTokenExpiry();

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    await this.notificationService.sendVerificationEmail(
      email,
      fullName,
      verificationToken,
    );

    // Return user without sensitive information
    return this.prisma.excludePasswordFromUser(newUser) as SafeUser;
  }

  /**
   * Log in with email and password
   */
  async login(loginInput: LoginInput): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const { email, password } = loginInput;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if password matches
    if (!user.password) {
      throw new UnauthorizedException('Please log in with the social provider you used to register');
    }

    const passwordMatches = await comparePasswords(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.prisma.excludePasswordFromUser(user) as SafeUser,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenInput: RefreshTokenInput): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenInput;

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecretKey) as { sub: string; email: string };
      
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch  {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Google authentication
   */
  async googleLogin(socialLoginInput: SocialLoginInput): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const { token, fullName } = socialLoginInput;

    try {
      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Find or create user
      let user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (user) {
        // Update Google ID if it's not set
        if (!user.googleId) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { googleId: payload.sub },
          });
        }
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: payload.email,
            fullName: fullName || payload.name || 'Google User',
            googleId: payload.sub,
            emailVerified: true, // Google emails are verified
            isActive: true,
          },
        });

        // Send welcome email
        await this.notificationService.sendWelcomeEmail(
          user.email,
          user.fullName,
        );
      }

      // Generate tokens
      const tokens = this.generateTokens(user);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.prisma.excludePasswordFromUser(user) as SafeUser,
      };
    } catch  {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Apple authentication
   */
  async appleLogin(socialLoginInput: SocialLoginInput): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, fullName } = socialLoginInput;

    try {
      // Here you would validate the Apple ID token
      // This is simplified for now, you should use apple-auth library for this
      const appleId = 'apple-id'; // This would come from token verification
      const email = 'apple-email'; // This would come from token verification

      // Find or create user
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update Apple ID if it's not set
        if (!user.appleId) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { appleId },
          });
        }
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: fullName || 'Apple User',
            appleId,
            emailVerified: true, // Apple emails are verified
            isActive: true,
          },
        });

        // Send welcome email
        await this.notificationService.sendWelcomeEmail(
          user.email,
          user.fullName,
        );
      }

      // Generate tokens
      const tokens = this.generateTokens(user);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.prisma.excludePasswordFromUser(user) as SafeUser,
      };
    } catch  {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(verifyEmailInput: VerifyEmailInput): Promise<SafeUser> {
    const { verificationToken: token } = verifyEmailInput;

    // Find user by verification token
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified and clear verification token
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Send welcome email
    await this.notificationService.sendWelcomeEmail(
      updatedUser.email,
      updatedUser.fullName,
    );

    return this.prisma.excludePasswordFromUser(updatedUser) as SafeUser;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(requestPasswordResetInput: RequestPasswordResetInput): Promise<boolean> {
    const { email } = requestPasswordResetInput;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Return true even if user doesn't exist for security reasons
    if (!user || !user.isActive) {
      return true;
    }

    // Generate reset token
    const resetPasswordToken = generateResetToken();
    const resetPasswordTokenExpiry = getResetTokenExpiry();

    // Update user with reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordTokenExpiry,
      },
    });

    // Send password reset email
    await this.notificationService.sendPasswordResetEmail(
      user.email,
      resetPasswordToken,
    );

    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordInput: ResetPasswordInput): Promise<boolean> {
    const { token, password } = resetPasswordInput;

    // Find user by reset token
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user with new password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return true;
  }

  /**
   * Validate user by JWT payload
   */
  async validateUser(payload: { sub: string; email: string }): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.prisma.excludePasswordFromUser(user) as SafeUser;
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecretKey,
      expiresIn: this.jwtExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtRefreshSecretKey,
      expiresIn: this.jwtRefreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}