import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HmoModule } from './hmo/hmo.module';
import { WalletModule } from './wallet/wallet.module';
import { ClaimModule } from './claim/claim.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';
import { typeOrmConfig } from './config/data-source';
import { CacheModule } from './cache/cache.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    UserModule.register(),
    RoleModule,
    AuditLogModule,
    HmoModule,
    WalletModule,
    ClaimModule,
    PaymentModule,
    NotificationModule,
    CacheModule.register(),
    EmailModule.register(),
    AuthModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
