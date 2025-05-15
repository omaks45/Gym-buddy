/* eslint-disable prettier/prettier */
import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";


@InputType()
export class SocialLoginInput {
  @Field()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @Field({ nullable: true })
  fullName?: string;
}
