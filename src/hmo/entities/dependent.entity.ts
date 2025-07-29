import { Entity, Column, ManyToOne } from 'typeorm';
import { PlanSubscription } from './plan-subscription.entity';
import { DependentType } from '../../utils/types';
import { BaseEntity } from '../../config/repository/base-entity';

@Entity('dependents')
export class Dependent extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dob: Date;

  @Column({ type: 'enum', enum: DependentType })
  relationship: DependentType;

  @Column()
  enrolleeNo: string;

  @ManyToOne(() => PlanSubscription, (subscription) => subscription.dependents)
  subscription: PlanSubscription;
}
