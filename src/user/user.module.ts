import { DynamicModule, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { DynamicRepositoryService } from 'src/audit-log/dynamic-repository.service';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';
import { CacheService } from 'src/cache/cache.service';
import { redisConnection } from 'src/config';
import { EmailService } from 'src/email/email.service';
import { HmoRepository } from 'src/hmo/repositories/hmo.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { RoleRepository } from 'src/role/repositories/role.repository';
import { RoleService } from 'src/role/role.service';
import { EncryptionService } from 'src/utils/encryption.service';

@Module({})
export class UserModule {
  static register(): DynamicModule {
    return {
      global: true,
      imports: [TypeOrmModule.forFeature([User])],
      controllers: [UserController],
      module: UserModule,
      providers: [
        UserService,
        UserRepository,
        EncryptionService,
        CacheService,
        RoleService,
        EmailService,
        RoleRepository,
        NotificationRepository,
        AuditLogService,
        AuditLogRepository,
        DynamicRepositoryService,
        HmoRepository,
        {
          provide: 'IOREDIS_INSTANCE',
          useValue: redisConnection,
        },
      ],
      exports: [
        UserService,
        UserRepository,
        EncryptionService,
        CacheService,
        NotificationRepository,
      ],
    };
  }
}
