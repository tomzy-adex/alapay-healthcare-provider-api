import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { User } from '../../user/entities/user.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column()
  action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE'

  @Column({ type: 'json', nullable: true })
  oldValue: Record<string, any> | null; // Previous state of the entity

  @Column({ type: 'json', nullable: true })
  newValue: Record<string, any> | null; // New state of the entity

  @Column()
  entityName: string; // e.g., 'User', 'Order'

  @Column({ nullable: true })
  entityId: string; // ID of the affected entity

  @ManyToOne(() => User, (user) => user.auditLogs, { onDelete: 'CASCADE' })
  user: User;
}
