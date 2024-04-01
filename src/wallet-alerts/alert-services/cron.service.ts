import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletDbService } from 'src/prisma-db/wallets/wallet.service';
import { TelegramService } from '../telegram-services/send-alerts.service';
import { FetchService } from '../simple-hash-services/fetch.service';
import { DeltaService } from './delta.service';
import { User_Wallet } from '@prisma/client';

@Injectable()
export class CronService {
  constructor(
    private readonly walletDbActions: WalletDbService,
    private readonly fetchService: FetchService,
    private readonly deltaService: DeltaService,
    private readonly telegramService: TelegramService,
  ) { }

  private readonly logger = new Logger(CronService.name);

  async onModuleInit() {
    await this.populateInitialData();
  }

  async populateInitialData() {
    this.logger.log('Populating initial data');
    //get all wallets that require initial seeding
    const wallets = await this.walletDbActions.getAllAlertWallets();
    // console.log('wallets in db: ', wallets);
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

  @Cron('*/1 * * * *')
  async handleCron() {
    this.logger.log('CRON Alerts');
    //seed new wallets with initial data
    // this.populateInitialData();

    //get all wallets that require alerting
    const wallets: User_Wallet[] | any = await this.walletDbActions.getAllAlertWallets();
    // console.log('wallets in db: ', wallets);

    //extract wallet ids
    const walletIds = wallets.map((wallet: any) => wallet.wId);

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
    if (deltaWallets.length === 0) {
      console.log('No delta wallets or transactions found');
      console.log('-------------------------------------------\n\n\n\n\n\n\n\n');
      return;
    }

    // console.log('deltaWallets: ', deltaWallets);
    // console.log('wallets', wallets);
    // console.log('walletsLatestTxnData: ', walletsLatestTxnData);
    // console.log('walletsResponses: ', walletsResponses);

    const deltaTransactions = await this.deltaService.calcDelta(
      deltaWallets,
      wallets,
      walletsLatestTxnData,
      walletsResponses,
    );

    //update wallets latest transaction in DB
    await this.walletDbActions.updateWalletsFields(
      deltaWallets,
      walletsLatestTxnData,
    );

    console.log('deltaTransactions: ', deltaTransactions);

    const deltaWalletsList = Object.keys(deltaTransactions);
    const owners = await this.walletDbActions.getAllWalletOwners(deltaWalletsList);

    console.log('owners: ', owners);

    const mergedData = this.mergeDeltaTransactionsAndOwners(deltaTransactions, owners);
    console.log("mergedData", mergedData);

    await this.telegramService.sendAlerts(mergedData);

    console.log('-------------------------------------------\n\n\n\n\n\n\n\n');
  }

  private mergeDeltaTransactionsAndOwners(deltaTransactions: Record<string, any[]>, owners: Record<string, any[]>) {
    const merged = {};
  
    for (const walletId in deltaTransactions) {
      const transactions = deltaTransactions[walletId];
      const walletOwners = owners[walletId];
  
      const validOwners = walletOwners.filter((owner) => owner.teleId !== null);
  
      if (validOwners.length > 0) {
        merged[walletId] = {
          transactions,
          owners: validOwners,
        };
      }
    }
  
    return merged;
  }
}
