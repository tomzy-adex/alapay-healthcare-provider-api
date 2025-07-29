import { BaseEntity } from '../../config/repository/base-entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
