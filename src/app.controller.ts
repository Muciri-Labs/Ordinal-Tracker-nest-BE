import { Controller, Get, Post } from '@nestjs/common';
import { WalletDbService } from './prisma-db/wallets/wallet.service';

@Controller()
export class AppController {
  constructor(private readonly walletService: WalletDbService) {}

  @Post('/wallet')
  async addWallet() {
    return this.walletService.addWallet('1', true);
  }

  @Get('/wallet')
  async getWallet() {
    return this.walletService.getWallet('1');
  }
}
