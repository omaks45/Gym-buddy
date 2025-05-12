/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType, Float } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Message } from '../../messages/models/message.model';

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
export class PotentialMatch {
  @Field(() => User)
  user: User;
  
  @Field(() => Boolean, { nullable: true })
  hasLikedYou?: boolean;
  
  @Field(() => Float, { nullable: true })
  compatibilityScore?: number;
  
  @Field(() => Float, { nullable: true })
  distance?: number;
}