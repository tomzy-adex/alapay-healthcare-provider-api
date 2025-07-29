import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HospitalInfo } from '../entities/hospital-info.entity';

@Injectable()
export class HospitalInfoRepository extends TypeOrmRepository<HospitalInfo> {
  constructor(private readonly dataSource: DataSource) {
    super(HospitalInfo, dataSource.createEntityManager());
  }
}
