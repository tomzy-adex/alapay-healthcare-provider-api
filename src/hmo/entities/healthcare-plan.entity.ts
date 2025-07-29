import { BaseEntity } from '../../config/repository/base-entity';
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Hmo } from './hmo.entity';
import { Status } from '../../utils/types';
import { Hospital } from './hospital.entity';
import { AccountTier } from './account-tier.entity';
import { PaymentOption } from '../../payment/entities/payment-option.entity';
import { PlanSubscription } from './plan-subscription.entity';

@Entity('healthcare_plans')
export class HealthcarePlan extends BaseEntity {
  @Column()
  name: string;

  @Column()
  coverageType: string;

  @Column()
  pricingStructure: string;

  @Column({ default: false })
  familyPlanAvailable: boolean;

  @Column({ type: 'float', nullable: true })
  dependentDiscountRate?: number;

  @Column({ type: 'int', nullable: true })
  maxDependents?: number;

  @Column({ default: Status.DORMANT })
  status: Status;

  @Column({ type: 'json', nullable: true })
  planBenefits?: Record<string, any>;

  @ManyToOne(() => Hmo, (hmo) => hmo.plans, {
    cascade: true,
  })
  hmo: Hmo;

  @ManyToMany(() => Hospital, (hospital) => hospital.plans, {
    cascade: true,
  })
  hospitals: Hospital[];

  @ManyToMany(() => AccountTier, (tier) => tier.healthcarePlans, {
    cascade: true,
  })
  @JoinTable() // This decorator creates the join table in the database
  accountTiers: AccountTier[];

  @OneToMany(() => PaymentOption, (option) => option.plan, {
    cascade: true,
  })
  paymentOptions: PaymentOption[];

  @OneToMany(() => PlanSubscription, (subscription) => subscription.plan, {
    cascade: true,
  })
  subscriptions: PlanSubscription[];

  // --- Activation Criteria Fields ---
  @Column({ type: 'int', nullable: true })
  minimumUsersRequired?: number; // Minimum number of HMO users required to activate the plan

  @Column({ type: 'float', nullable: true })
  minimumPremiumRequired?: number; // Minimum premium payment required to activate the plan
}
