import { Module } from '@nestjs/common';
import { CronService } from './alert-services/cron.service';
import { PrismaDbModule } from 'src/prisma-db/prisma-db.module';
import { HttpModule } from '@nestjs/axios';
import { FetchService } from './simple-hash-services/fetch.service';
import { DeltaService } from './alert-services/delta.service';
import { TelegramService } from './telegram-services/send-alerts.service';

@Module({
  imports: [PrismaDbModule, HttpModule],
  providers: [CronService, FetchService, TelegramService, DeltaService],
  exports: [CronService],
})
export class WalletAlertsModule { }
