import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { HealthcarePlan } from './healthcare-plan.entity';
import { Status } from '../../utils/types';
import { BaseEntity } from '../../config/repository/base-entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Dependent } from './dependent.entity';
import { PreAuthRequest } from './pre-auth-request.entity';

@Entity('plan_subscriptions')
export class PlanSubscription extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: Status.DORMANT })
  status: Status;

  @Column()
  enrolleeNo: string;

  @ManyToOne(() => HealthcarePlan, { nullable: true })
  queuedPlan?: HealthcarePlan; // Plan that will activate at the next cycle

  @Column({ type: 'date', nullable: true })
  switchActivationDate?: Date;

  @OneToMany(() => Dependent, (dependent) => dependent.subscription, {
    cascade: true,
  })
  dependents: Dependent[];

  @ManyToOne(() => Payment, (payment) => payment.subscriptions)
  payment: Payment;

  @ManyToOne(() => HealthcarePlan, (plan) => plan.subscriptions)
  plan: HealthcarePlan;

  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;

  @OneToMany(() => PreAuthRequest, (request) => request.subscriptions)
  request: PreAuthRequest[];
}
