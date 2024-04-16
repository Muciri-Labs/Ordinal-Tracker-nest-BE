import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WalletDbService } from './wallets/wallet.service';
import { FloorDbService } from './floors/floor.service';
import { UserService } from './users/user.service';

@Module({
  providers: [PrismaService, WalletDbService, FloorDbService, UserService],
  exports: [WalletDbService, FloorDbService, UserService],
})
export class PrismaDbModule { }
