import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { User } from '../../user/entities/user.entity';
import { UserRoles } from '../../utils/types';

@Entity('roles')
export class Role extends BaseEntity {
  @Column()
  permission: UserRoles;
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
