import { DataSource } from 'typeorm';
import { Hmo } from '../entities/hmo.entity';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HmoRepository extends TypeOrmRepository<Hmo> {
  constructor(private readonly dataSource: DataSource) {
    super(Hmo, dataSource.createEntityManager());
  }
}
