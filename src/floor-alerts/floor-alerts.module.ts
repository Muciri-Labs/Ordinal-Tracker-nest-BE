import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CronService } from './alert-services/cron.service';
import { DeltaService } from './alert-services/delta.service';
import { FetchService } from './simple-hash-services/fetch.service';
import { PrismaDbModule } from 'src/prisma-db/prisma-db.module';
import { TelegramService } from './telegram-services/send-alerts.service';

@Module({
    imports: [PrismaDbModule, HttpModule],
    providers: [CronService, FetchService, DeltaService, TelegramService],
    exports: [CronService],
})
export class FloorAlertsModule { }
