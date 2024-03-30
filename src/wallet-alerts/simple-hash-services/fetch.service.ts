import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class FetchService {
  async fetchWalletsLatestTxn(walletIds: string[]) {
    const headers = {
      'x-api-key': process.env.SIMPLE_HASH,
    };

    const walletsLatestTxnData = {};
    const walletsResponses = {};

    for (const walletId of walletIds) {
      const url = `https://api.simplehash.com/api/v0/nfts/transfers/wallets?chains=bitcoin&wallet_addresses=${walletId}`;

      try {
        const response: AxiosResponse = await axios.get(url, { headers });

        if (response.status !== 200) {
          console.log('response status: ', response);
          throw new Error(`Received status code ${response.status}`);
        }

        walletsResponses[walletId] = response.data;
        const latestTransaction = response.data.transfers[0];
        walletsLatestTxnData[walletId] = {
          collectionId: latestTransaction.collection_id,
          transactionId: latestTransaction.transaction,
          From: latestTransaction.from_address,
          To: latestTransaction.to_address,
          TimeStamp: latestTransaction.timestamp,
        };
      } catch (error) {
        throw new Error(
          `Failed to fetch latest transaction for wallet ${walletId} because of error \n${error}`,
        );
      }
    }

    return { walletsLatestTxnData, walletsResponses };
  }
}
