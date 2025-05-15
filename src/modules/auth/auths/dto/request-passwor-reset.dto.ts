/* eslint-disable prettier/prettier */
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}