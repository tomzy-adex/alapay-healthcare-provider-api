import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { HealthcarePlan } from '../entities/healthcare-plan.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthcarePlanRepository extends TypeOrmRepository<HealthcarePlan> {
  constructor(private readonly dataSource: DataSource) {
    super(HealthcarePlan, dataSource.createEntityManager());
  }
}
