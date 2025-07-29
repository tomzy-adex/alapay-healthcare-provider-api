import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Claim } from '../entities/claim.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClaimRepository extends TypeOrmRepository<Claim> {
  constructor(private readonly dataSource: DataSource) {
    super(Claim, dataSource.createEntityManager());
  }
}
