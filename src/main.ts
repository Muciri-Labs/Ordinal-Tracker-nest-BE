import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // app.enableCors({
  //   origin: ['https://ordinal-tracker.onrender.com', 'http://localhost:3001'],
  //   credentials: true,
  // });
  app.enableCors({
    origin: ['http://localhost:3001', 'https://ordinal-tracker.onrender.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // app.enableCors();
  await app.listen(3000);
}
bootstrap();