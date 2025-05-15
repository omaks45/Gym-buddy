/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Profile } from '../../profiles/models/profile.model';
import { Match } from '../../matching/models/match.model';
import { Group } from '../../groups/models/group.model';
import { Message } from '../../messages/models/message.model';
import { Location } from '../../locations/models/location.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  googleId?: string;
  
  @Field({ nullable: true })
  appleId?: string;

  @Field()
  isActive: boolean;

  @Field()
  emailVerified: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Profile, { nullable: true })
  profile?: Profile;

  @Field(() => Location, { nullable: true })
  lastLocation?: Location;
  
  @Field(() => [Match], { nullable: true })
  matches?: Match[];

  @Field(() => [Group], { nullable: true })
  groups?: Group[];

  @Field(() => [Message], { nullable: true })
  sentMessages?: Message[];

  @Field(() => [Message], { nullable: true })
  receivedMessages?: Message[];

  // Fields not exposed in GraphQL
  password?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
}