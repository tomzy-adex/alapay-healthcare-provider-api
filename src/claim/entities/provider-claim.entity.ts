import { BaseEntity } from 'src/config/repository/base-entity';
import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { Hmo } from 'src/hmo/entities/hmo.entity';
import { ManyToOne } from 'typeorm';
import { Hospital } from 'src/hmo/entities/hospital.entity';
import { ProcessStatus } from 'src/utils/types';
import { PreAuthRequest } from 'src/hmo/entities/pre-auth-request.entity';
import { ClaimPayment } from 'src/payment/entities/claim-payment.entity';
import { Note } from './note.entity';

@Entity('health_provider_claims')
export class ProviderClaim extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  enrolleeNo: string;

  @Column({ type: 'varchar', length: 255 })
  claimReference: string;

  @Column({ type: 'json', nullable: true })
  serviceBreakdown: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  documents: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'json', nullable: true })
  testResults: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  dischargeSummary?: string;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ type: 'text', nullable: true })
  authorizationCode: string;

  @ManyToOne(() => Hmo, (hmo) => hmo.providerClaims, { nullable: true })
  hmo: Hmo;

  @ManyToOne(() => Hospital, (hospital) => hospital.providerClaims, {
    nullable: true,
  })
  hospital: Hospital;

  @OneToOne(() => PreAuthRequest, (request) => request.providerClaim, {
    nullable: true,
  })
  request: PreAuthRequest;

  @OneToOne(() => ClaimPayment, (payment) => payment.providerClaim, {
    cascade: true,
    nullable: true,
  })
  payment: ClaimPayment;

  @OneToMany(() => Note, (notes) => notes.providerClaim, {
    cascade: true,
  })
  notes: Note[];
}
