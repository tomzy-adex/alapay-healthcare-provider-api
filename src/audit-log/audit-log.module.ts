import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditLog } from './entities/audit-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit-interceptor.service';
import { DynamicRepositoryService } from './dynamic-repository.service';
import { UserRepository } from 'src/user/repositories/user.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { RoleRepository } from 'src/role/repositories/role.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditLogService,
    AuditLogRepository,
    DynamicRepositoryService,
    UserRepository,
    NotificationRepository,
    RoleRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor, //
    },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
