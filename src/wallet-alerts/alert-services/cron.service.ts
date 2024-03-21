import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletDbService } from 'src/prisma-db/wallets/wallet.service';
import { FetchService } from '../simple-hash-services/fetch.service';

@Injectable()
export class CronService {
  constructor(
    private readonly walletDbActions: WalletDbService,
    private readonly fetchService: FetchService,
  ) {}

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
    try {
      const walletsLatestTxnData: Record<
        string,
        {
          collectionId: string;
          transactionId: string;
          From: string;
          To: string;
          TimeStamp: string;
        }
      > = await this.fetchService.fetchWalletsLatestTxn(walletIds);
      console.log('walletsLatestTxnData: ', walletsLatestTxnData);

      //update wallets with activity
      await this.walletDbActions.updateWalletsFields(
        walletIds,
        walletsLatestTxnData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch latest transactions: ${error.message}`,
      );
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    this.logger.log('CRON Alerts');
  }
}
