/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Enable security headers
  app.use(helmet());
  
  // Enable compression
  app.use(compression());
  
  // Enable CORS
  app.enableCors();
  
  // Handle Prisma shutdown
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  
  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();