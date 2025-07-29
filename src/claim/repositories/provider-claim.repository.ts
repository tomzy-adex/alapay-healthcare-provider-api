import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { ProviderClaim } from '../entities/provider-claim.entity';

@Injectable()
export class ProviderClaimRepository extends TypeOrmRepository<ProviderClaim> {
  constructor(private readonly dataSource: DataSource) {
    super(ProviderClaim, dataSource.createEntityManager());
  }
}
