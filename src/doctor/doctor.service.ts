import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity/doctor.entity';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async createDoctor(doctorData: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorRepo.create(doctorData);
    return this.doctorRepo.save(doctor);
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return this.doctorRepo.find({
      order: { name: 'ASC' }
    });
  }

  async getDoctorById(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['appointments', 'queueItems']
    });
    
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    return doctor;
  }

  async updateDoctor(id: number, updates: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.getDoctorById(id);
    
    // Just merge the updates - TypeORM handles the rest
    Object.assign(doctor, updates);
    return this.doctorRepo.save(doctor);
  }

  async deleteDoctor(id: number): Promise<void> {
    const doctor = await this.getDoctorById(id);
    await this.doctorRepo.remove(doctor);
  }

  async changeStatus(id: number, newStatus: 'available' | 'busy' | 'off-duty'): Promise<Doctor> {
    return this.updateDoctor(id, { status: newStatus });
  }

  async getAvailableDoctors(): Promise<Doctor[]> {
    return this.doctorRepo.find({
      where: { status: 'available' },
      order: { name: 'ASC' }
    });
  }
}
