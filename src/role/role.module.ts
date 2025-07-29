import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './repositories/role.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { DynamicRepositoryService } from 'src/audit-log/dynamic-repository.service';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';
import { UserRepository } from 'src/user/repositories/user.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [
    RoleService,
    RoleRepository,
    AuditLogService,
    AuditLogRepository,
    UserRepository,
    DynamicRepositoryService,
    NotificationRepository,
  ],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
