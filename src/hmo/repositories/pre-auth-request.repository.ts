import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { PreAuthRequest } from '../entities/pre-auth-request.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PreAuthRequestRepository extends TypeOrmRepository<PreAuthRequest> {
  constructor(private readonly dataSource: DataSource) {
    super(PreAuthRequest, dataSource.createEntityManager());
  }
}
