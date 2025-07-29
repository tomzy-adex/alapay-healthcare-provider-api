import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Injectable } from '@nestjs/common';
import { AccountTier } from '../entities/account-tier.entity';

@Injectable()
export class AccountTierRepository extends TypeOrmRepository<AccountTier> {
  constructor(private readonly dataSource: DataSource) {
    super(AccountTier, dataSource.createEntityManager());
  }
}
