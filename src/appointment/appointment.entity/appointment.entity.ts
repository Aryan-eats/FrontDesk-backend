import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from '../../doctor/doctor.entity/doctor.entity';

@Entity('appointments')
export class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  patientEmail: string;

  @Column({ nullable: true })
  patientPhone: string;

  @Column()
  appointmentTime: Date;

  @Column({ default: 'booked' })
  status: 'booked' | 'completed' | 'canceled' | 'in-progress';

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Doctor, doctor => doctor.appointments, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
