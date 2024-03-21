import { Injectable } from '@nestjs/common';
import { Wallet } from '@prisma/client';

@Injectable()
export class DeltaService {
  async getDeltaWalletsList(
    wallets: Wallet[],
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
  ): Promise<string[]> {
    const deltaWallets: string[] = [];

    for (const wallet of wallets) {
      const latestTxnData = walletsLatestTxnData[wallet.wId];

      if (
        !latestTxnData ||
        wallet.lastTrackedTransaction !== latestTxnData.transactionId ||
        wallet.lastTrackedTimeStamp !== latestTxnData.TimeStamp
      ) {
        deltaWallets.push(wallet.wId);
      }
    }

    return deltaWallets;
  }

  // 1. Initialize an empty object deltaTransactions.
  //
  // 2. For each wallet ID in deltaWallets:
  //
  //       2.1. Get the wallet object from wallets using the wallet ID.
  //       2.2. Get the previous transaction ID and timestamp from the
  //                  wallet object.
  //       2.3. Get the latest transaction data from walletsLatestTxnData
  //                  using the wallet ID.
  //       2.4. Get the response data from walletActivity using the
  //                  wallet ID.
  //       2.5. Initialize an empty array walletDeltaTransactions.
  //       2.6. For each transaction in the response data's transfers
  //                  array:
  //
  //                 2.6.1. If the transaction's ID is
  //                          the same as the previous
  //                          transaction ID, break the loop.
  //                 2.6.2. If the transaction's
  //                         timestamp is later than the previous
  //                         timestamp, add the transaction to
  //                         walletDeltaTransactions.
  //
  //        2.7. Add walletDeltaTransactions to deltaTransactions
  //                   with the wallet ID as the key.
  //
  //
  // 3. Return deltaTransactions.

  async calcDelta(
    wallets: Wallet[],
    deltaWallets: string[],
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
    walletActivity: Record<string, any>,
  ) {
    const deltaTransactions: Record<string, any[]> = {};

    for (const walletId of deltaWallets) {
      const wallet = wallets.find((w) => w.wId === walletId);
      const previousTransactionId = wallet?.lastTrackedTransaction;
      const previousTimeStamp = wallet?.lastTrackedTimeStamp;
      const latestTransactionData = walletsLatestTxnData[walletId];
      const responseData = walletActivity[walletId];

      const walletDeltaTransactions = [];
      for (const transaction of responseData.transfers) {
        if (transaction.transaction === previousTransactionId) {
          break;
        }
        if (new Date(transaction.timestamp) > new Date(previousTimeStamp)) {
          walletDeltaTransactions.push(transaction);
        }
      }

      deltaTransactions[walletId] = walletDeltaTransactions;
    }

    return deltaTransactions;
  }
}
