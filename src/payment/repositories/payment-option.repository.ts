import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { DataSource } from 'typeorm';
import { PaymentOption } from '../entities/payment-option.entity';

@Injectable()
export class PaymentOptionRepository extends TypeOrmRepository<PaymentOption> {
  constructor(private readonly dataSource: DataSource) {
    super(PaymentOption, dataSource.createEntityManager());
  }
}
