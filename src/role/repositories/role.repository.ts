import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Role } from '../entities/role.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class RoleRepository extends TypeOrmRepository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }
}
