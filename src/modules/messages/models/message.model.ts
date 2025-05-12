/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Match } from '../../matching/models/match.model';
import { Group } from '../../groups/models/group.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field({ nullable: true })
  matchId?: string;

  @Field({ nullable: true })
  groupId?: string;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  sender?: User;

  @Field(() => User)
  receiver?: User;

  @Field(() => Match, { nullable: true })
  match?: Match;

  @Field(() => Group, { nullable: true })
  group?: Group;
}

@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string; // Either matchId or groupId

  @Field()
  name: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => Boolean)
  isGroup: boolean;

  @Field(() => Message, { nullable: true })
  lastMessage?: Message;

  @Field(() => Int)
  unreadCount: number;

  @Field()
  updatedAt: Date;
}