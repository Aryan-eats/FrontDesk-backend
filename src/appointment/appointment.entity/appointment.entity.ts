import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Doctor } from '../../doctor/doctor.entity/doctor.entity';

@Entity('appointments')
export class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  patientPhone: string;

  @Column()
  appointmentTime: Date;

  @Column({ default: 'booked' })
  status: 'booked' | 'completed' | 'canceled';

  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: number;

  @CreateDateColumn()
  createdAt: Date;
}
