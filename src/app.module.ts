import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaDbModule } from './prisma-db/prisma-db.module';
import { WalletDbService } from './prisma-db/wallets/wallet.service';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [PrismaDbModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, WalletDbService],
})
export class AppModule {}
