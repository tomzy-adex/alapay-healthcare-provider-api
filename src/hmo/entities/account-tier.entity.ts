import { BaseEntity } from '../../config/repository/base-entity';
import { Entity, Column, ManyToMany } from 'typeorm';
import { HealthcarePlan } from './healthcare-plan.entity';
import { Hmo } from './hmo.entity';

@Entity('account_tiers')
export class AccountTier extends BaseEntity {
  @Column()
  name: string; // Tier name (e.g., Bronze, Silver, Gold)

  @Column({ type: 'float' })
  premium: number; // Premium amount for the tier

  @Column({ type: 'text' })
  coverageDetails: string; // Description of coverage for the tier

  @ManyToMany(() => Hmo, (hmo) => hmo.accountTiers)
  hmo: Hmo;

  @ManyToMany(() => HealthcarePlan, (plan) => plan.accountTiers)
  healthcarePlans?: HealthcarePlan[]; // Many-to-Many relationship
}
