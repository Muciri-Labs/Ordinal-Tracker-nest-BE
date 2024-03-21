import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class WalletDbService {
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

  async getAllWallets(): Promise<Wallet[]> {
    try {
      return this.prisma.wallet.findMany({
        where: {
          alertsEnabled: true,
        },
      });
    } catch (error) {
      console.error('An error occurred while fetching all wallets:', error);
      throw error;
    }
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

  async updateWalletsFields(
    walletIds: string[],
    walletsLatestTxnData: Record<
      string,
      {
        collectionId: string;
        transactionId: string;
        From: string;
        To: string;
        TimeStamp: string;
      }
    >,
  ) {
    try {
      for (const walletId of walletIds) {
        const wallet = await this.getWallet(walletId);
        const latestTxnData = walletsLatestTxnData[walletId];
        if (latestTxnData) {
          await this.prisma.wallet.update({
            where: { wId: walletId },
            data: {
              lastTrackedTransaction: latestTxnData.transactionId,
              lastTrackedTimeStamp: latestTxnData.TimeStamp,
            },
          });
        }
      }
    } catch (error) {
      console.error('An error occurred while updating wallets:', error);
      throw error;
    }
  }
}
