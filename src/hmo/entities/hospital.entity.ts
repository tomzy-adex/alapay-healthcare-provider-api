import { BaseEntity } from '../../config/repository/base-entity';
import {
  Entity,
  Column,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { HealthcarePlan } from './healthcare-plan.entity';
import { User } from '../../user/entities/user.entity';
import { Hmo } from './hmo.entity';
import { ProviderClaim } from 'src/claim/entities/provider-claim.entity';
import { HospitalInfo } from './hospital-info.entity';
import { ProcessStatus, Status } from 'src/utils/types';

@Entity('hospitals')
export class Hospital extends BaseEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ default: false })
  emergencyServiceProvider: boolean;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ default: Status.DORMANT })
  accountStatus: Status;

  @Column({ nullable: true })
  verificationComments: string;

  @ManyToMany(() => HealthcarePlan, (plan) => plan.hospitals)
  @JoinTable() // Defines the owner side of the relationship and creates the junction table
  plans: HealthcarePlan[];

  @ManyToMany(() => User, (users) => users.hospitals)
  users: User[];

  @ManyToMany(() => Hmo, (hmo) => hmo.hospitals)
  hmos: Hmo[];

  @OneToMany(() => ProviderClaim, (providerClaims) => providerClaims.hospital)
  providerClaims: ProviderClaim[];

  @OneToOne(() => HospitalInfo, (hospitalInfo) => hospitalInfo.hospital, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  hospitalInfo: HospitalInfo;
}
