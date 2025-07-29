import { DataSource } from 'typeorm';
import { Hospital } from '../entities/hospital.entity';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HospitalRepository extends TypeOrmRepository<Hospital> {
  constructor(private readonly dataSource: DataSource) {
    super(Hospital, dataSource.createEntityManager());
  }
}
