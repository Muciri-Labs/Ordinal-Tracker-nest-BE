import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaDbModule } from './prisma-db/prisma-db.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletAlertsModule } from './wallet-alerts/wallet-alerts.module';
@Module({
  imports: [PrismaDbModule, ScheduleModule.forRoot(), WalletAlertsModule],
  controllers: [AppController],
})
export class AppModule {}
