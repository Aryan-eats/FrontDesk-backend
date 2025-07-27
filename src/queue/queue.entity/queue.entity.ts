import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Doctor } from '../../doctor/doctor.entity/doctor.entity';

@Entity('queue')
export class QueueEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  patientPhone: string;

  @Column()
  queueNumber: number;

  @Column({ default: 'waiting' })
  status: 'waiting' | 'with-doctor' | 'completed';

  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ nullable: true })
  doctorId: number;

  @CreateDateColumn()
  arrivalTime: Date;
}
