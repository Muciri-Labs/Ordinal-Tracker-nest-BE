import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FloorDbService } from 'src/prisma-db/floors/floor.service';

@Injectable()
export class TelegramService {
    constructor(private floorDbService: FloorDbService) { }

    async sendAlerts(alertUsers: Record<string, {
        deltaValue: number;
        users: string[];
    }>): Promise<void> {
        const uniqueUsers = [...new Set(Object.values(alertUsers).flatMap(alert => alert.users))];
        // const userChatIds = await Promise.all(uniqueUsers.map(userId => this.floorDbService.getUserByUserId(userId).then(user => user.teleId)));

        //mocking user chat ids
        //for every unique user create a sample chat id string in userChatIds[]
        const userChatIds = uniqueUsers.map(userId => `1416592158`); 

        const collections = await Promise.all(Object.keys(alertUsers).map(collectionId => this.floorDbService.getCollectionById(collectionId)));

        for (const [index, userId] of uniqueUsers.entries()) {
            const userAlerts = Object.entries(alertUsers).filter(([_, alert]) => alert.users.includes(userId));
            const messages = userAlerts.map(([collectionId, alert]) => {
                const collection = collections.find(collection => collection.cId === collectionId);
                const direction = alert.deltaValue > 0 ? 'increased' : 'decreased';
                return `The value of ${collection.name} has ${direction} by ${Math.abs(alert.deltaValue)}%. [Collection Image](${collection.image})`;
            });
            await this.sendTelegramMessages(userChatIds[index], messages);
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
            // Handle the error here
            console.error('Error sending Telegram messages:', error);
            throw error; // Rethrow the error to propagate it to the caller
        }
    }
}