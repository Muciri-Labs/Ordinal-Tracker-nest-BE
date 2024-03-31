import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WalletDbService } from './wallets/wallet.service';
import { FloorDbService } from './floors/floor.service';

@Module({
  providers: [PrismaService, WalletDbService, FloorDbService],
  exports: [WalletDbService, FloorDbService],
})
export class PrismaDbModule { }
