/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './modules/auth/auths/auths.module';
import { AppResolver } from './app.resolver';
//import { UsersModule } from './modules/users/users.module';
//import { ProfilesModule } from './modules/profiles/profiles.module';
//import { LocationsModule } from './modules/locations/locations.module';
//import { MatchingModule } from './modules/matching/matching.module';
//import { GroupsModule } from './modules/groups/groups.module';
//import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
        sortSchema: true,
        playground: configService.get('NODE_ENV') !== 'production',
        debug: configService.get('NODE_ENV') !== 'production',
        context: ({ req, connection }) => {
          // For subscriptions
          if (connection) {
            return { req: { headers: connection.context } };
          }
          return { req };
        },
        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': true,
        },
        cors: {
          origin: configService.get('CORS_ORIGIN', '*'),
          credentials: true,
        },
        formatError: (error) => {
          const graphQLFormattedError = {
            message: error.message,
            path: error.path,
            extensions: {
              code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
              exception: {
                stacktrace: configService.get('NODE_ENV') !== 'production' 
                  ? (error.extensions?.exception as any)?.stacktrace 
                  : undefined,
              },
            },
          };
          return graphQLFormattedError;
        },
      }),
    }),
    PrismaModule,
    AuthModule,
   //UsersModule,
    NotificationsModule,
    //ProfilesModule,
    //LocationsModule,
    //MatchingModule,
    //GroupsModule,
    //MessagesModule,
  ],

  providers: [AppResolver],
})
export class AppModule {}