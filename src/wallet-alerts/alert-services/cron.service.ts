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
    const mockWalletIds = [
      'bc1pgg09mqmyd7zknl4yu35tf0acm5h6eemv7k5efw9k4sxzt8ss7ymskzxr85',
      'bc1p5vnzpcfse6ycn6wkrjyu0xhptvg95z22jxxlntpx20ph2jk8eqyqshgepj',
      'bc1pk60fcp57tmg8efxcp5qqqadkcre2953avnm0934n3anc0p5fyhrqmepj86',
      'bc1paqnrzwn9rcvq7r52ea7ym7ve99e7psurfjgfaj2quj7x2fftej8q5rfuc9',
    ];
    try {
      const walletsLatestTxnData = await this.fetchService.fetchWalletsLatestTxn(mockWalletIds);
      //update wallets with activity
    } catch (error) {
      this.logger.error(
        `Failed to fetch latest transactions: ${error.message}`,
      );
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    this.logger.log('Called every second');
  }
}
