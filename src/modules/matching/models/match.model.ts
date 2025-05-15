/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Message } from "src/modules/messages/models/message.model";
import { User } from "src/modules/users/models/user.model";

/* eslint-disable prettier/prettier */
@ObjectType()
export class Match {
  @Field(() => ID)
  id: string;

  @Field()
  user1Id: string;

  @Field()
  user2Id: string;

  @Field()
  createdAt: Date;

  @Field(() => User)
  user1?: User;

  @Field(() => User)
  user2?: User;

  @Field(() => [Message], { nullable: true })
  messages?: Message[];
}

@ObjectType()
export class Like {
  @Field(() => ID)
  id: string;

  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field()
  isLiked: boolean;

  @Field()
  createdAt: Date;

  @Field(() => User)
  sender?: User;

  @Field(() => User)
  receiver?: User;

  @Field(() => Match, { nullable: true })
  match?: Match;
}
