import { ProcessStatus } from '../../utils/types';
import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { PlanSubscription } from './plan-subscription.entity';
import { BaseEntity } from '../../config/repository/base-entity';
import { ProviderClaim } from 'src/claim/entities/provider-claim.entity';

@Entity()
export class PreAuthRequest extends BaseEntity {
  @Column('json')
  treatmentDetails: Record<string, any>;

  @Column('json')
  providerInfo: Record<string, any>;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @ManyToOne(() => PlanSubscription, (subscription) => subscription.request, {
    cascade: true,
  })
  subscriptions: PlanSubscription;

  @OneToOne(() => ProviderClaim, (ProviderClaim) => ProviderClaim.request, {
    cascade: true,
    nullable: true,
  })
  providerClaim: ProviderClaim;
}
