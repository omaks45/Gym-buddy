/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER',
}

export enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

registerEnumType(Gender, {
  name: 'Gender',
});

registerEnumType(FitnessLevel, {
  name: 'FitnessLevel',
});

@ObjectType()
export class Profile {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  birthDate: Date;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => FitnessLevel)
  fitnessLevel: FitnessLevel;

  @Field(() => [String])
  fitnessGoals: string[];

  @Field(() => [String])
  workoutPreferences: string[];

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => [String], { nullable: true })
  profileImages?: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  user?: User;
}