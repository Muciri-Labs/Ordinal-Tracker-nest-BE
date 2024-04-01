import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Wallet, User_Wallet } from '@prisma/client';

@Injectable()
export class WalletDbService {
  constructor(private prisma: PrismaService) { }

  async getWallet(walletId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { wId: walletId },
    });
  }

  async getUserWallet(userId: string, walletId: string): Promise<User_Wallet | null> {
    return this.prisma.user_Wallet.findUnique({
      where: { uId_wId: { uId: userId, wId: walletId } },
    });
  }

  async addWallet(walletId: string): Promise<Wallet> {
    return this.prisma.wallet.create({
      data: {
        wId: walletId,
        lastTrackedTransaction: '',
        lastTrackedTimeStamp: '',
      },
    });
  }

  async addUserWallet(userId: string, walletId: string, alertsEnabled: boolean): Promise<User_Wallet> {
    return this.prisma.user_Wallet.create({
      data: {
        uId: userId,
        wId: walletId,
        alertsEnabled,
      },
    });
  }

  async getAllAlertWallets(): Promise<Wallet[]> {
    try {
      const wallets = await this.prisma.user_Wallet.findMany({
        where: { alertsEnabled: true },
      });
      const walletDetails: Wallet[] = [];
      for (const wallet of wallets) {
        const walletDetail = await this.prisma.wallet.findUnique({
          where: { wId: wallet.wId },
        });
        walletDetails.push(walletDetail);
      }
      return walletDetails;
    } catch (error) {
      console.error('An error occurred while fetching all wallets:', error);
      throw error;
    }
  }

  async getAlertsEnabled(userId: string, walletId: string): Promise<boolean> {
    const userWallet = await this.getUserWallet(userId, walletId);
    return userWallet?.alertsEnabled ?? false;
  }

  async getLastTrackedTransaction(walletId: string): Promise<string> {
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

  async getAllWalletOwners(walletIds: string[]) {
    const owners = {};

    console.log('getting all owners of every delta wallet');

    for (const walletId of walletIds) {
      const userWallets = await this.prisma.user_Wallet.findMany({
        where: {
          wId: walletId,
        },
        include: {
          user: true,
        },
      });

      owners[walletId] = userWallets.map((userWallet) => userWallet.user);
    }

    return owners;
  }
}