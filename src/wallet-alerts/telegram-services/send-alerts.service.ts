import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FloorDbService } from 'src/prisma-db/floors/floor.service';

interface Transaction {
    nft_id: string;
    chain: string;
    contract_address: string;
    token_id: string;
    collection_id: string;
    event_type: string;
    from_address: string;
    to_address: string;
    quantity: number;
    quantity_string: string;
    timestamp: string;
    block_number: number;
    block_hash: string;
    transaction: string;
    transaction_initiator: string;
    log_index: number;
    batch_transfer_index: number;
    sale_details: string;
}

interface Owner {
    uId: string;
    username: string;
    email: string;
    password: string;
    teleId: string;
}

interface Wallet {
    transactions: Transaction[];
    owners: Owner[];
}

@Injectable()
export class TelegramService {
    constructor(private floorDbService: FloorDbService) { }

    async sendAlerts(wallets: Record<string, Wallet>): Promise<void> {
        const authToken = '6658629224:AAGWPEsdquKLfus0b-R0WZp-Q9ql4tM-mTM';
        const url = `https://api.telegram.org/bot${authToken}/sendMessage`;

        for (const [walletAddress, wallet] of Object.entries(wallets)) {
            for (const transaction of wallet.transactions) {
                const collection = await this.floorDbService.getCollectionById(transaction.collection_id);
                const message = `The wallet ${walletAddress} has a new transaction of ${collection.name} from/to wallet ${transaction.to_address} at time ${transaction.timestamp} of type ${transaction.event_type}`;

                for (const owner of wallet.owners) {
                    if (owner.teleId === null) {
                        continue;
                    }
                    const payload = { chat_id: owner.teleId, text: message, parse_mode: 'Markdown' };

                    try {
                        await axios.post(url, payload);
                    } catch (error) {
                        console.error('Error sending Telegram message:', error);
                        throw error;
                    }
                }
            }
        }
    }
}