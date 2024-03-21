import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaDbModule } from './prisma-db/prisma-db.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [PrismaDbModule, ScheduleModule.forRoot()],
  controllers: [AppController],
})
export class AppModule {}
