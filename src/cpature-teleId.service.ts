import { Injectable } from '@nestjs/common'
import * as TelegramBot from 'node-telegram-bot-api'
import { UserService } from './prisma-db/users/user.service';

@Injectable()
export class CaptureTelegramService {
    private TELEGRAM_BOT_TOKEN: string;
    bot: any;

    constructor(private userService: UserService) {
        this.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = new TelegramBot(this.TELEGRAM_BOT_TOKEN, { polling: true }); // Fix the property name
        this.bot.on('message', this.onReceiveMessage);
    }

    onReceiveMessage = async (msg: TelegramBot.Message) => { // Fix the type of 'msg' parameter
        // console.log(msg);
        // console.log(msg.text); // Fix the property access
        if (msg.text && msg.text.startsWith('/start')) {
            const commandParts = msg.text.split(' ');
            if (commandParts.length === 2) {
                const userId = commandParts[1];
                console.log("userId:", userId);
                if (userId != "" || userId != null) {
                    const user = await this.userService.updateUser(userId, { teleId: msg.chat.id.toString() });
                    console.log("user tele updated: ", user);
                    this.bot.sendMessage(msg.chat.id, `Your Telegram ID has been successfully captured!`);
                }
            };
        }
    }
}