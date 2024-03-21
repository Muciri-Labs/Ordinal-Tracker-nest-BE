import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WalletDbService } from './wallets/wallet.service';

@Module({
  providers: [PrismaService, WalletDbService],
  exports: [WalletDbService],
})
export class PrismaDbModule {}