/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors();

  // Prisma graceful shutdown
  const prismaService = app.get(PrismaService);
  process.on('SIGINT', async () => {
    await prismaService.$disconnect();
    await app.close();
  });
  process.on('SIGTERM', async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
