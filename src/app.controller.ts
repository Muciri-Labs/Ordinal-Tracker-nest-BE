import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { WalletService } from './prisma-db/wallets/wallet.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly walletService: WalletService,
  ) {}

  @Post("/wallet")
  async addWallet() {
    return this.walletService.addWallet('1', true);
  }

  @Get("/wallet")
  async getWallet() {
    return this.walletService.getWallet('1');
  }

}
