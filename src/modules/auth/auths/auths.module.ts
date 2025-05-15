/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../auths/auths.service';
//import { UsersModule } from '../../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
//import { GoogleStrategy } from './strategies/google.strategy';
//import { AuthGuard } from './guards/auth.guard';
//import { RolesGuard } from './guards/roles.guard';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AuthResolver } from './auths.resolver';

@Module({
  imports: [
   //UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
    NotificationsModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    //GoogleStrategy,
    //AuthGuard,
    //RolesGuard,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}