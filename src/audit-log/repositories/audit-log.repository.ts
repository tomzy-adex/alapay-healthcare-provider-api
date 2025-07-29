import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository extends TypeOrmRepository<AuditLog> {
  constructor(private readonly dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }
}
