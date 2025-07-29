import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { DataSource } from 'typeorm';
import { ClaimPayment } from '../entities/claim-payment.entity';

@Injectable()
export class ClaimPaymentRepository extends TypeOrmRepository<ClaimPayment> {
  constructor(private readonly dataSource: DataSource) {
    super(ClaimPayment, dataSource.createEntityManager());
  }
}
