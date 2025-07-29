import { DynamicModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { redisConnection } from '../config';

@Module({})
export class CacheModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: CacheModule,
      providers: [
        CacheService,
        {
          provide: 'IOREDIS_INSTANCE',
          useValue: redisConnection,
        },
      ],
      exports: [CacheService],
    };
  }
}
