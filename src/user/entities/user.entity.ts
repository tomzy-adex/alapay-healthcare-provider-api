import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../../config/repository/base-entity';
import { Role } from '../../role/entities/role.entity';
import { ProcessStatus, Status } from '../../utils/types';
import { Hmo } from '../../hmo/entities/hmo.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Claim } from '../../claim/entities/claim.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { AuditLog } from '../../audit-log/entities/audit-log.entity';
import { Hospital } from '../../hmo/entities/hospital.entity';
import { PlanSubscription } from 'src/hmo/entities/plan-subscription.entity';
import { Note } from 'src/claim/entities/note.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  dob: Date;

  @Column()
  password: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ default: Status.DORMANT })
  accountStatus: Status;

  @Column({ default: false })
  isDeveloper: boolean;

  @ManyToMany(() => Hospital, (hospital) => hospital.users, { cascade: true })
  hospitals: Hospital[];

  @ManyToOne(() => Role, (role) => role.users, { cascade: true })
  role: Role;

  @ManyToOne(() => Hmo, (hmo) => hmo.user, { cascade: true })
  hmo: Hmo;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Claim, (claim) => claim.user, { cascade: true })
  claims: Claim[];

  @OneToMany(() => Payment, (payment) => payment.user, { cascade: true })
  payments: Payment[];

  @OneToMany(() => PlanSubscription, (subscriptions) => subscriptions.user, {
    cascade: true,
  })
  subscriptions: PlanSubscription[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications: Notification[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user, { cascade: true })
  auditLogs: AuditLog[];

  @OneToMany(() => Note, (notes) => notes.user, {
    cascade: true,
  })
  notes: Note[];
}
