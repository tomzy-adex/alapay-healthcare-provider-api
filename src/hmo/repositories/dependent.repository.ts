import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Dependent } from '../entities/dependent.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DependentRepository extends TypeOrmRepository<Dependent> {
  constructor(private readonly dataSource: DataSource) {
    super(Dependent, dataSource.createEntityManager());
  }
}
