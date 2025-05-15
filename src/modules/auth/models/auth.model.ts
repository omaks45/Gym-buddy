/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType({ description: 'Response returned after successful login or registration' })
export class AuthResponse {
  @Field({ description: 'Access token for authenticated requests' })
  accessToken: string;

  @Field({ description: 'Refresh token for renewing sessions' })
  refreshToken: string;

  @Field(() => User, { description: 'Authenticated user info' })
  user: User;
}

@ObjectType()
export class TokenResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}