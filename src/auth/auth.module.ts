import { DynamicModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CacheService } from '../cache/cache.service';
import { EncryptionService } from '../utils/encryption.service';
import { UserRepository } from '../user/repositories/user.repository';
import { EmailService } from '../email/email.service';
import { redisConnection } from '../config';
import { JwtStrategy } from 'src/utils/auth.strategy';
import { DynamicRepositoryService } from 'src/audit-log/dynamic-repository.service';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { RoleRepository } from 'src/role/repositories/role.repository';

@Module({})
export class AuthModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      providers: [
        JwtStrategy,
        AuthService,
        CacheService,
        EncryptionService,
        UserRepository,
        EmailService,
        DynamicRepositoryService,
        AuditLogRepository,
        NotificationRepository,
        RoleRepository,
        {
          provide: 'IOREDIS_INSTANCE',
          useValue: redisConnection,
        },
      ],
      controllers: [AuthController],
      exports: [AuthService],
    };
  }
}
