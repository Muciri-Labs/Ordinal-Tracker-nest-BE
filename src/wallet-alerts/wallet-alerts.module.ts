import { Module } from '@nestjs/common';
import { WalletAlertsControllerController } from './wallet-alerts-controller/wallet-alerts-controller.controller';

@Module({
  controllers: [WalletAlertsControllerController]
})
export class WalletAlertsModule {}
