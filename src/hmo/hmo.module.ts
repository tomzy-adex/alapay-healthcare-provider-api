import { Global, Module } from '@nestjs/common';
import { HmoController } from './hmo.controller';
import { HmoService } from './hmo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTier } from './entities/account-tier.entity';
import { HealthcarePlan } from './entities/healthcare-plan.entity';
import { Hmo } from './entities/hmo.entity';
import { Hospital } from './entities/hospital.entity';
import { PlanSubscription } from './entities/plan-subscription.entity';
import { PlanSubscriptionRepository } from './repositories/plan-subscription.repository';
import { HealthcarePlanRepository } from './repositories/healthcare-plan.repository';
import { HmoRepository } from './repositories/hmo.repository';
import { HospitalRepository } from './repositories/hospital.repository';
import { DependentRepository } from './repositories/dependent.repository';
import { Dependent } from './entities/dependent.entity';
import { PreAuthRequest } from './entities/pre-auth-request.entity';
import { PreAuthRequestRepository } from './repositories/pre-auth-request.repository';
import { HospitalInfoRepository } from './repositories/hospital-info.repository';
import { UserRepository } from 'src/user/repositories/user.repository';
import { AccountTierRepository } from './repositories/account-tier.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountTier,
      HealthcarePlan,
      Hmo,
      Hospital,
      PlanSubscription,
      Dependent,
      PreAuthRequest,
    ]),
  ],
  controllers: [HmoController],
  providers: [
    HmoService,
    PlanSubscriptionRepository,
    HealthcarePlanRepository,
    HmoRepository,
    HospitalRepository,
    DependentRepository,
    PreAuthRequestRepository,
    HospitalInfoRepository,
    AccountTierRepository,
    UserRepository,
  ],
  exports: [
    HmoService,
    PlanSubscriptionRepository,
    HealthcarePlanRepository,
    HmoRepository,
    HospitalRepository,
    DependentRepository,
    PreAuthRequestRepository,
    HospitalInfoRepository,
    AccountTierRepository,
  ],
})
export class HmoModule {}
