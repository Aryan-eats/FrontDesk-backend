import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AppointmentEntity } from './appointment.entity/appointment.entity';
import { DoctorService } from '../doctor/doctor.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
    private doctorService: DoctorService,
  ) {}

  async createAppointment(appointmentData: CreateAppointmentDto): Promise<AppointmentEntity> {
    await this.doctorService.getDoctorById(appointmentData.doctorId);
    
    const appointmentTime = new Date(appointmentData.appointmentTime);
    const conflict = await this.checkTimeConflict(
      appointmentData.doctorId, 
      appointmentTime
    );
    
    if (conflict) {
      throw new BadRequestException('Doctor already has an appointment at this time');
    }

    const appointment = this.appointmentRepo.create(appointmentData);
    return this.appointmentRepo.save(appointment);
  }

  async getAllAppointments(): Promise<AppointmentEntity[]> {
    return this.appointmentRepo.find({ 
      relations: ['doctor'],
      order: { appointmentTime: 'ASC' }
    });
  }

  async getAppointmentById(id: number): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  async updateAppointment(id: number, updates: UpdateAppointmentDto): Promise<AppointmentEntity> {
    const appointment = await this.getAppointmentById(id);
    
    if (updates.appointmentTime) {
      const newTime = new Date(updates.appointmentTime);
      const conflict = await this.checkTimeConflict(
        appointment.doctorId, 
        newTime, 
        id
      );
      
      if (conflict) {
        throw new BadRequestException('Doctor already has an appointment at this time');
      }
    }
    
    Object.assign(appointment, updates);
    return this.appointmentRepo.save(appointment);
  }

  async deleteAppointment(id: number): Promise<void> {
    const appointment = await this.getAppointmentById(id);
    await this.appointmentRepo.remove(appointment);
  }

  async getTodayAppointments(): Promise<AppointmentEntity[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    return this.appointmentRepo.find({
      where: {
        appointmentTime: Between(startOfDay, endOfDay)
      },
      relations: ['doctor'],
      order: { appointmentTime: 'ASC' }
    });
  }

  private async checkTimeConflict(
    doctorId: number, 
    appointmentTime: Date, 
    excludeId?: number
  ): Promise<AppointmentEntity | null> {
    const timeBuffer = 30 * 60 * 1000; 
    const startTime = new Date(appointmentTime.getTime() - timeBuffer);
    const endTime = new Date(appointmentTime.getTime() + timeBuffer);
    
    const query = this.appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.appointmentTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime
      })
      .andWhere('appointment.status != :status', { status: 'canceled' });
    
    if (excludeId) {
      query.andWhere('appointment.id != :excludeId', { excludeId });
    }
    
    return query.getOne();
  }
}
