import { DataSource } from 'typeorm';
import { PlanSubscription } from '../entities/plan-subscription.entity';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanSubscriptionRepository extends TypeOrmRepository<PlanSubscription> {
  constructor(private readonly dataSource: DataSource) {
    super(PlanSubscription, dataSource.createEntityManager());
  }
}
