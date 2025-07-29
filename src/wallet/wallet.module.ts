import { Global, Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { WalletRepository } from './repositories/wallet.repository';

@Global()
@Module({
  imports: [Wallet],
  providers: [WalletService, WalletRepository],
  controllers: [WalletController],
  exports: [WalletService, WalletRepository],
})
export class WalletModule {}
