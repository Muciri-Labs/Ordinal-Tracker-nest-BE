import { Module } from '@nestjs/common';
import { CronService } from './alert-services/cron.service';
import { PrismaDbModule } from 'src/prisma-db/prisma-db.module';
import { HttpModule } from '@nestjs/axios';
import { FetchService } from './simple-hash-services/fetch.service';

@Module({
  imports: [PrismaDbModule, HttpModule],
  providers: [CronService, FetchService],
  exports: [CronService],
})
export class WalletAlertsModule {}
