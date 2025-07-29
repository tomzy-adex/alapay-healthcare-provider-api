import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { Payment } from '../../payment/entities/payment.entity';
import { ProcessStatus } from '../../utils/types';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ProcessStatus, default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ nullable: true })
  reference?: string;

  @OneToMany(() => Payment, (payment) => payment.transaction)
  payments: Payment[];
}
