import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FloorDbService } from 'src/prisma-db/floors/floor.service';

@Injectable()
export class TelegramService {
    constructor(private floorDbService: FloorDbService) { }

    async sendAlerts(
        alertUsers: Record<string, {
            deltaValue: number;
            users: {
                userId: string;
                timeStamp: string;
            }[];
        }>,
        latestFloorPrices: Record<string, number>
    ): Promise<void> {
        const uniqueUsers = [...new Set(Object.values(alertUsers).flatMap(alert => alert.users.map(user => user.userId)))];

        const userChatIdPairs = (await Promise.all(
            uniqueUsers.map(userId =>
                this.floorDbService.getUserByUserId(userId)
            )
        )).filter(user => user.teleId !== null).map(user => ({ userId: user.uId, chatId: user.teleId }));

        if (userChatIdPairs.length === 0) {
            console.log('No users to send alerts to.');
            return;
        }

        const collections = await Promise.all(Object.keys(alertUsers).map(collectionId => this.floorDbService.getCollectionById(collectionId)));

        for (const { userId, chatId } of userChatIdPairs) {
            const userAlerts = Object.entries(alertUsers).filter(([_, alert]) => alert.users.some(user => user.userId === userId));
            const messages = userAlerts.map(([collectionId, alert]) => {
                const collection = collections.find(collection => collection.cId === collectionId);
                const direction = alert.deltaValue > 0 ? 'increased' : 'decreased';
                const user = alert.users.find(user => user.userId === userId);
                const timeDifference = new Date().getTime() - new Date(user.timeStamp).getTime();
                const timeDifferenceInHours = Math.floor(timeDifference / 3600000);
                const timeDifferenceInMinutes = Math.round((timeDifference % 3600000) / 60000);
                const latestFloorPrice = latestFloorPrices[collectionId];
                return `${collection.name} floor ${direction} by ${Math.abs(alert.deltaValue)}% in ${timeDifferenceInHours}H ${timeDifferenceInMinutes}M. Current Floor = ${latestFloorPrice} BTC [Collection Image](${collection.image})`;
            });
            await this.sendTelegramMessages(chatId, messages);
        }
    }
    private async sendTelegramMessages(chatId: string, messages: string[]): Promise<void> {
        try {
            const authToken = '6658629224:AAGWPEsdquKLfus0b-R0WZp-Q9ql4tM-mTM';
            const url = `https://api.telegram.org/bot${authToken}/sendMessage`;
            for (const message of messages) {
                const payload = { chat_id: chatId, text: message, parse_mode: 'Markdown' };
                await axios.post(url, payload);
            }
        } catch (error) {
            console.error('Error sending Telegram messages:', error);
            throw error;
        }
    }
}