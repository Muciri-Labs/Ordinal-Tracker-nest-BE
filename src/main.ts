import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // app.enableCors({
  //   origin: ['https://ordinal-tracker.onrender.com', 'http://localhost:3001'],
  //   credentials: true,
  // });
  // app.enableCors({
  //   origin: function (origin, callback) {
  //     const allowedOrigins = ['https://ordinal-tracker.onrender.com', 'http://localhost:3001'];
  //     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   credentials: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  // });
  app.enableCors();

  app.set('trust proxy', 1);

  await app.listen(3000);
}

bootstrap();
