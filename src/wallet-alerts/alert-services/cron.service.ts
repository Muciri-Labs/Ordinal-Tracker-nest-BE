import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletDbService } from 'src/prisma-db/wallets/wallet.service';

@Injectable()
export class CronService {
  constructor(private readonly walletDbActions: WalletDbService) {}

  private readonly logger = new Logger(CronService.name);

  async onModuleInit() {
    await this.populateInitialData();
  }

  async populateInitialData() {
    this.logger.log('Populating initial data');

    //get all wallets that require initial seeding
    const wallets = await this.walletDbActions.getAllWallets();
    console.log('wallets in db: ', wallets);
    //extract wallet ids
    const walletIds = wallets.map((wallet) => wallet.wId);
    //call simple hash API to fetch wallet activity
    //update wallets with activity
  }

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    this.logger.log('Called every second');
  }
}
