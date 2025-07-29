import { Global, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentOption } from './entities/payment-option.entity';
import { EmailService } from 'src/email/email.service';
import { HealthcarePlanRepository } from 'src/hmo/repositories/healthcare-plan.repository';
import { PlanSubscriptionRepository } from 'src/hmo/repositories/plan-subscription.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { UserRepository } from 'src/user/repositories/user.repository';
import { PaymentOptionRepository } from './repositories/payment-option.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { DynamicRepositoryService } from 'src/audit-log/dynamic-repository.service';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';
import { RoleRepository } from 'src/role/repositories/role.repository';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { ClaimPayment } from './entities/claim-payment.entity';
import { ClaimPaymentRepository } from './repositories/claim-payment.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentOption,
      Transaction,
      ClaimPayment,
    ]),
  ],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentOptionRepository,
    HealthcarePlanRepository,
    PlanSubscriptionRepository,
    UserRepository,
    NotificationRepository,
    EmailService,
    DynamicRepositoryService,
    AuditLogRepository,
    RoleRepository,
    TransactionRepository,
    ClaimPaymentRepository,
  ],
  controllers: [PaymentController],
  exports: [
    PaymentService,
    PaymentService,
    PaymentRepository,
    PaymentOptionRepository,
    DynamicRepositoryService,
    ClaimPaymentRepository,
    TransactionRepository,
  ],
})
export class PaymentModule {}
