import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Notification } from '../entities/notification.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationRepository extends TypeOrmRepository<Notification> {
  constructor(private readonly dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }
}
