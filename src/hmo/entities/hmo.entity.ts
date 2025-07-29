import { BaseEntity } from '../../config/repository/base-entity';
import { User } from '../../user/entities/user.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Entity, Column, OneToMany, ManyToMany } from 'typeorm';
import { HealthcarePlan } from './healthcare-plan.entity';
import { ProcessStatus, Status } from '../../utils/types';
import { AccountTier } from './account-tier.entity';
import { Hospital } from './hospital.entity';
import { ProviderClaim } from 'src/claim/entities/provider-claim.entity';

@Entity('hmos')
export class Hmo extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ default: Status.DORMANT })
  accountStatus: Status;

  @Column({ nullable: true })
  verificationComments: string;

  @OneToMany(() => User, (user) => user.hmo)
  admin: User[];

  @OneToMany(() => User, (user) => user.hmo)
  user: User[];

  @OneToMany(() => HealthcarePlan, (plan) => plan.hmo)
  plans: HealthcarePlan[];

  @OneToMany(() => Notification, (notification) => notification.hmo)
  notifications: Notification[];

  @OneToMany(() => AccountTier, (accountTiers) => accountTiers.hmo)
  accountTiers: AccountTier[];

  @ManyToMany(() => Hospital, (hospital) => hospital.hmos, { cascade: true })
  hospitals: Hospital[];

  @OneToMany(() => ProviderClaim, (providerClaims) => providerClaims.hmo)
  providerClaims: ProviderClaim[];
}
