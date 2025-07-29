import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class WalletRepository extends TypeOrmRepository<Wallet> {
  constructor(private readonly dataSource: DataSource) {
    super(Wallet, dataSource.createEntityManager());
  }
}
