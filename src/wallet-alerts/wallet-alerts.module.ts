import { Module } from '@nestjs/common';
import { CronService } from './alert-services/cron.service';
import { PrismaDbModule } from 'src/prisma-db/prisma-db.module';

@Module({
  imports: [PrismaDbModule],
  providers: [CronService],
  exports: [CronService],
})
export class WalletAlertsModule {}
