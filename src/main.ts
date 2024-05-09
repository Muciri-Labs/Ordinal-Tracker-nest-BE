import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // app.enableCors({
  //   origin: ['https://ordinal-tracker.onrender.com', 'http://localhost:3001'],
  //   credentials: true,
  // });
  // app.enableCors({
  //   origin: function (origin, callback) {
  //     // Add logic here to dynamically allow origins based on a list, or a database check, etc.
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
  app.set('trust proxy', 1);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();