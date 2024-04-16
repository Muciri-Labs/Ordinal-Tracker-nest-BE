

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async updateUser(userId: string, data: { teleId: string; }) {
        return this.prisma.user.update({
            where: { uId: userId },
            data,
        });
    }

    async getUserByUserId(userId: string) {
        return this.prisma.user.findUnique({
            where: { uId: userId },
        });
    }
}