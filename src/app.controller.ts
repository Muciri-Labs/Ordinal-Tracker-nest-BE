import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletDbService } from './prisma-db/wallets/wallet.service';

@Controller()
export class AppController {
  constructor(private readonly walletService: WalletDbService) { }

  @Post('/wallet')
  async addWallet(@Body() body: any) {
    const { walletId } = body;
    return this.walletService.addWallet(walletId);
  }

  @Get('/wallet')
  async getWallet(@Body() body: any) {
    const { walletId } = body;
    return this.walletService.getWallet(walletId);
  }

  @Post('/user-wallet')
  async addUserWallet(@Body() body: any) {
    const { userId, walletId, alertsEnabled } = body;
    return this.walletService.addUserWallet(userId, walletId, alertsEnabled);
  }
}
