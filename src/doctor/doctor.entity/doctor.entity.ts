import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialization: string;

  @Column()
  gender: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  availability: string; // JSON string for schedule

  @Column({ default: 'available' })
  status: 'available' | 'busy' | 'off-duty';

  @OneToMany('AppointmentEntity', 'doctor')
  appointments: any[];

  @OneToMany('QueueEntity', 'doctor')
  queueItems: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
