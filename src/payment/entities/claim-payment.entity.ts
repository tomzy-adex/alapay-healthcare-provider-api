import { ProviderClaim } from 'src/claim/entities/provider-claim.entity';
import { BaseEntity } from 'src/config/repository/base-entity';
import { ClaimPaymentStatus } from 'src/utils/types';
import { Entity, Column, OneToOne } from 'typeorm';

@Entity('health_provider_claim_payments')
export class ClaimPayment extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountExpected: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'varchar', length: 100 })
  hmoName: string;

  @Column({ type: 'enum', enum: ClaimPaymentStatus })
  status: ClaimPaymentStatus;

  @Column({ type: 'boolean', nullable: true })
  isFlagged: boolean;

  @Column({ type: 'text', nullable: true })
  flagReason: string;

  @Column({ type: 'text', nullable: true })
  flaggedBy: string;

  @Column({ type: 'text', nullable: true })
  createdBy: string;

  @OneToOne(() => ProviderClaim, (providerClaim) => providerClaim.payment, {
    nullable: true,
  })
  providerClaim: ProviderClaim;
}
