/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Message } from '../../messages/models/message.model';

export enum GroupRole {
  MEMBER = 'MEMBER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

registerEnumType(GroupRole, {
  name: 'GroupRole',
});

@ObjectType()
export class Group {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  ownerId: string;

  @Field()
  isPrivate: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  owner?: User;

  @Field(() => [UserGroup], { nullable: true })
  members?: UserGroup[];

  @Field(() => [Message], { nullable: true })
  messages?: Message[];

  @Field(() => Int)
  memberCount?: number;
}

@ObjectType()
export class UserGroup {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  groupId: string;

  @Field(() => GroupRole)
  role: GroupRole;

  @Field()
  joinedAt: Date;

  @Field(() => User)
  user?: User;

  @Field(() => Group)
  group?: Group;
}