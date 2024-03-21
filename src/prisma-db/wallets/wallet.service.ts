import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(walletId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { wId: walletId },
    });
  }

async addWallet(walletId: string, alertsEnabled: boolean): Promise<Wallet> {
    return this.prisma.wallet.create({
        data: {
            wId: walletId,
            alertsEnabled,
            lastTrackedTransaction: '',
            lastTrackedTimeStamp: '',
            uId: '1',
        },
    });
}

async getAlertsEnabled(walletId: string): Promise<boolean> {
    const wallet = await this.getWallet(walletId);
    return wallet?.alertsEnabled ?? false;
}

  async getLastTrackedTracsaction(walletId: string): Promise<string> {
    const wallet = await this.getWallet(walletId);
    return wallet?.lastTrackedTransaction ?? '';
  }

  async getLastTrackedTimeStamp(walletId: string): Promise<string> {
    const wallet = await this.getWallet(walletId);
    return wallet?.lastTrackedTimeStamp ?? '';
  }
}
