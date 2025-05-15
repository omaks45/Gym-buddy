/* eslint-disable prettier/prettier */
// src/app.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello from GraphQL!';
  }
}
