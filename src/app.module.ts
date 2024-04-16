import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaDbModule } from './prisma-db/prisma-db.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletAlertsModule } from './wallet-alerts/wallet-alerts.module';
import { FloorAlertsModule } from './floor-alerts/floor-alerts.module';
import { CaptureTelegramService } from './cpature-teleId.service';
@Module({
  imports: [PrismaDbModule, ScheduleModule.forRoot(), WalletAlertsModule, FloorAlertsModule],
  providers: [CaptureTelegramService],
  // imports: [PrismaDbModule, ScheduleModule.forRoot()],
  controllers: [AppController],
})
export class AppModule { }



