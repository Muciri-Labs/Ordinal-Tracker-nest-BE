import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletAlertsModule } from './wallet-alerts/wallet-alerts.module';

@Module({
  imports: [WalletAlertsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
