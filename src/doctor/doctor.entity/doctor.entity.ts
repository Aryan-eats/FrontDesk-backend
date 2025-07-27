import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
  phone: string;

  @Column('simple-json', { nullable: true })
  availability: { day: string; startTime: string; endTime: string }[];

  @Column({ default: 'available' })
  status: 'available' | 'busy' | 'off-duty';

  @CreateDateColumn()
  createdAt: Date;
}
