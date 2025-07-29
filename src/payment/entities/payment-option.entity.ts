import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { PaymentDuration, PaymentOptionType } from '../../utils/types';
import { Payment } from './payment.entity';
import { HealthcarePlan } from '../../hmo/entities/healthcare-plan.entity';

@Entity('payment_options')
export class PaymentOption extends BaseEntity {
  @Column({ default: PaymentOptionType.MONTHLY })
  name: PaymentOptionType;

  @Column({ default: PaymentDuration.MONTHLY })
  duration: PaymentDuration;

  @OneToMany(() => Payment, (payment) => payment.paymentOption)
  payment: Payment[];

  @ManyToOne(() => HealthcarePlan, (plan) => plan.paymentOptions, {
    onDelete: 'CASCADE',
  })
  plan: HealthcarePlan;
}
