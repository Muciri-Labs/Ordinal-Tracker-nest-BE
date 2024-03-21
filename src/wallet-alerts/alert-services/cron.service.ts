import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletDbService } from 'src/prisma-db/wallets/wallet.service';
import { FetchService } from '../simple-hash-services/fetch.service';
import { DeltaService } from './delta.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class CronService {
  constructor(
    private readonly walletDbActions: WalletDbService,
    private readonly fetchService: FetchService,
    private readonly deltaService: DeltaService,
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
      const {
        walletsLatestTxnData,
      }: {
        walletsLatestTxnData: Record<
          string,
          {
            collectionId: string;
            transactionId: string;
            From: string;
            To: string;
            TimeStamp: string;
          }
        >;
      } = await this.fetchService.fetchWalletsLatestTxn(walletIds);

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
    //get all wallets that require alerting
    const wallets: Wallet[] | any = await this.walletDbActions.getAllWallets();
    console.log('wallets in db: ', wallets);

    //extract wallet ids
    const walletIds = wallets.map((wallet) => wallet.wId);

    //fetch latest Transaction details for all wallets
    const result = await this.fetchService.fetchWalletsLatestTxn(walletIds);

    const walletsLatestTxnData: Record<
      string,
      {
        collectionId: string;
        transactionId: string;
        From: string;
        To: string;
        TimeStamp: string;
      }
    > = result.walletsLatestTxnData;

    const walletsResponses: Record<string, any> = result.walletsResponses;

    //get list of wallets that have new activity
    const deltaWallets: string[] | any = await this.deltaService.getDeltaWalletsList(
      wallets,
      walletsLatestTxnData,
    );

    //get delta transactions for wallets with new activity
    const deltaTransactions = await this.deltaService.calcDelta(
      deltaWallets,
      wallets,
      walletsLatestTxnData,
      walletsResponses,
    );
  }
}
