/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType, Float } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Location {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field({ nullable: true })
  gymName?: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  user?: User;
}

@ObjectType()
export class NearbyUser {
  @Field(() => User)
  user: User;

  @Field(() => Float)
  distance: number; // Distance in kilometers or miles

  @Field({ nullable: true })
  gymName?: string;
}