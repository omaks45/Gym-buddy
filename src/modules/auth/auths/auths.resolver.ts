/* eslint-disable prettier/prettier */
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '../auths/auths.service';
import { RegisterInput } from './dto/signup.dto';
import { LoginInput } from './dto/login.dto';
import { RefreshTokenInput } from './dto/refresh-token.dto';
import { SocialLoginInput } from './dto/oauth.dto';
import { VerifyEmailInput } from './dto/verify-email.dto';
import { RequestPasswordResetInput } from './dto/request-passwor-reset.dto';
import { ResetPasswordInput } from './dto/reset-password.dto';
import { User } from '../../users/models/user.model';
import { AuthResponse, TokenResponse } from '../models/auth.model';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User, { description: 'Register a new user' })
  async register(@Args('signupInput') registerInput: RegisterInput): Promise<User> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => TokenResponse)
  async refreshToken(@Args('refreshtokenInput') refreshTokenInput: RefreshTokenInput): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenInput);
  }

  @Mutation(() => AuthResponse)
  async googleLogin(@Args('googleOginInput') socialLoginInput: SocialLoginInput): Promise<AuthResponse> {
    return this.authService.googleLogin(socialLoginInput);
  }

  @Mutation(() => AuthResponse)
  async appleLogin(@Args('appleLoginInput') socialLoginInput: SocialLoginInput): Promise<AuthResponse> {
    return this.authService.appleLogin(socialLoginInput);
  }

  @Mutation(() => Boolean)
  async verifyEmail(
    @Args('verifyEmailInput') verifyEmailInput: VerifyEmailInput,
  ) {
    return this.authService.verifyEmail(verifyEmailInput);
  }

  @Mutation(() => Boolean)
  async requestPasswordReset(@Args('requestPasswordResetInput') requestPasswordResetInput: RequestPasswordResetInput): Promise<boolean> {
    return this.authService.requestPasswordReset(requestPasswordResetInput);
  }

  @Mutation(() => Boolean)
  async resetPassword(@Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput): Promise<boolean> {
    return this.authService.resetPassword(resetPasswordInput);
  }
}