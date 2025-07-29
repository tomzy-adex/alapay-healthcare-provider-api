import { BaseEntity } from 'src/config/repository/base-entity';
import { Entity, Column, OneToOne } from 'typeorm';
import { Hospital } from './hospital.entity';

@Entity('hospital_info')
export class HospitalInfo extends BaseEntity {
  @Column({ length: 255 })
  accountName: string;

  @Column({ length: 10 })
  accountNumber: string;

  @Column({ length: 100 })
  bankName: string;

  @Column()
  bankCode: string;

  @OneToOne(() => Hospital, (hospital) => hospital.hospitalInfo, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  hospital: Hospital;
}
