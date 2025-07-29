import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { HealthcarePlan } from '../../hmo/entities/healthcare-plan.entity';
import { User } from '../../user/entities/user.entity';
import { ProcessStatus, ClaimType } from '../../utils/types';

@Entity('claims')
export class Claim extends BaseEntity {
  @Column()
  type: ClaimType;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column()
  details: string;

  @Column({ type: 'json', nullable: true })
  documents: Record<string, any>;

  @ManyToOne(() => User, (user) => user.claims)
  user: User;

  @ManyToOne(() => HealthcarePlan, (plan) => plan.hospitals)
  plan: HealthcarePlan;
}
