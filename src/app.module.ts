import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaDbModule } from './prisma-db/prisma-db.module';
import { WalletService } from './prisma-db/wallets/wallet.service';
@Module({
  imports: [PrismaDbModule],
  controllers: [AppController],
  providers: [AppService, WalletService],
})
export class AppModule {}
