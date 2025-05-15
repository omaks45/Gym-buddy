/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// Sign Up Input
@InputType({ description: 'Data required to register a new user' })
export class RegisterInput {
  @Field({ description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field({ description: 'User display name' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @Field({ description: 'User password' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}