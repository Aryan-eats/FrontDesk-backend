import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
  status: 'waiting' | 'with-doctor' | 'completed' | 'canceled';

  @Column({ default: 'normal' })
  priority: 'normal' | 'urgent';

  @Column({ nullable: true })
  estimatedWaitTime: number; // in minutes

  @ManyToOne(() => Doctor, doctor => doctor.queueItems, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ nullable: true })
  doctorId: number;

  @CreateDateColumn()
  arrivalTime: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
