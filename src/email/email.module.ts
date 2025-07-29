import { DynamicModule, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CacheService } from '../cache/cache.service';
import { redisConnection } from '../config';

@Module({})
export class EmailModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: EmailModule,
      providers: [
        EmailService,
        CacheService,
        {
          provide: 'IOREDIS_INSTANCE',
          useValue: redisConnection,
        },
      ],
      exports: [EmailService],
    };
  }
}
