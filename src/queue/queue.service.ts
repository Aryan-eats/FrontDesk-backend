import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntity } from './queue.entity/queue.entity';
import { DoctorService } from '../doctor/doctor.service';
import { CreateQueueDto, UpdateQueueDto } from './dto/queue.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntity)
    private queueRepo: Repository<QueueEntity>,
    private doctorService: DoctorService,
  ) {}

  async addToQueue(queueData: CreateQueueDto): Promise<QueueEntity> {
    // Check if doctor exists
    if (queueData.doctorId) {
      await this.doctorService.getDoctorById(queueData.doctorId);
    }

    // Get next queue number
    const lastQueue = await this.queueRepo.findOne({
      where: {},
      order: { queueNumber: 'DESC' }
    });
    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    const queueItem = this.queueRepo.create({
      ...queueData,
      queueNumber,
    });

    const savedQueue = await this.queueRepo.save(queueItem);
    
    // Update wait times for everyone
    await this.updateEstimatedWaitTime(savedQueue.id);
    
    return this.findOne(savedQueue.id);
  }

  async findAll(): Promise<QueueEntity[]> {
    return this.queueRepo.find({
      relations: ['doctor'],
      order: { 
        priority: 'DESC', // urgent first
        queueNumber: 'ASC' 
      }
    });
  }

  async findOne(id: number): Promise<QueueEntity> {
    const queueItem = await this.queueRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });
    
    if (!queueItem) {
      throw new NotFoundException(`Queue item with ID ${id} not found`);
    }
    
    return queueItem;
  }

  async update(id: number, updateQueueDto: UpdateQueueDto): Promise<QueueEntity> {
    console.log(`Queue Service: Updating queue item ${id} with data:`, updateQueueDto);
    
    const queueItem = await this.findOne(id);
    console.log(`Queue Service: Found queue item:`, queueItem);
    
    // Validate status transition if status is being updated
    if (updateQueueDto.status) {
      console.log(`Queue Service: Status transition from ${queueItem.status} to ${updateQueueDto.status}`);
      
      // Optional: Add business logic for valid status transitions
      const validTransitions = {
        'waiting': ['with-doctor', 'canceled'],
        'with-doctor': ['completed', 'waiting', 'canceled'],
        'completed': [], // Completed items cannot be changed
        'canceled': ['waiting'] // Canceled items can be reactivated
      };
      
      if (queueItem.status === 'completed' && updateQueueDto.status !== 'completed') {
        console.warn(`Queue Service: Attempting to change completed item status`);
        // Allow it but log warning
      }
    }
    
    Object.assign(queueItem, updateQueueDto);
    const savedItem = await this.queueRepo.save(queueItem);
    console.log(`Queue Service: Successfully saved queue item:`, savedItem);
    
    // Update estimated wait times for all queue items
    await this.updateAllEstimatedWaitTimes();
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const queueItem = await this.findOne(id);
    await this.queueRepo.remove(queueItem);
    
    // Update estimated wait times for remaining items
    await this.updateAllEstimatedWaitTimes();
  }

  async getWaitingQueue(): Promise<QueueEntity[]> {
    return this.queueRepo.find({
      where: { status: 'waiting' },
      relations: ['doctor'],
      order: { 
        priority: 'DESC', // urgent first
        queueNumber: 'ASC' 
      }
    });
  }

  async getByDoctor(doctorId: number): Promise<QueueEntity[]> {
    return this.queueRepo.find({
      where: { doctorId },
      relations: ['doctor'],
      order: { 
        priority: 'DESC',
        queueNumber: 'ASC' 
      }
    });
  }

  async callNext(doctorId?: number): Promise<QueueEntity | null> {
    const whereCondition: any = { status: 'waiting' };
    if (doctorId) {
      whereCondition.doctorId = doctorId;
    }

    // First try to get urgent patients
    let nextPatient = await this.queueRepo.findOne({
      where: { ...whereCondition, priority: 'urgent' },
      relations: ['doctor'],
      order: { queueNumber: 'ASC' }
    });

    // If no urgent patients, get next normal patient
    if (!nextPatient) {
      nextPatient = await this.queueRepo.findOne({
        where: { ...whereCondition, priority: 'normal' },
        relations: ['doctor'],
        order: { queueNumber: 'ASC' }
      });
    }

    if (nextPatient) {
      nextPatient.status = 'with-doctor';
      await this.queueRepo.save(nextPatient);
      
      // Update doctor status to busy if provided
      if (doctorId) {
        await this.doctorService.changeStatus(doctorId, 'busy');
      }
      
      await this.updateAllEstimatedWaitTimes();
    }

    return nextPatient;
  }

  async completePatient(id: number): Promise<QueueEntity> {
    const queueItem = await this.findOne(id);
    
    if (queueItem.status !== 'with-doctor') {
      throw new BadRequestException('Patient is not currently with doctor');
    }
    
    queueItem.status = 'completed';
    await this.queueRepo.save(queueItem);
    
    // Update doctor status back to available if they have no more waiting patients
    if (queueItem.doctorId) {
      const waitingForDoctor = await this.queueRepo.count({
        where: { 
          doctorId: queueItem.doctorId, 
          status: 'with-doctor' 
        }
      });
      
      if (waitingForDoctor === 0) {
        await this.doctorService.changeStatus(queueItem.doctorId, 'available');
      }
    }
    
    await this.updateAllEstimatedWaitTimes();
    
    return queueItem;
  }

  private async updateEstimatedWaitTime(queueId: number): Promise<void> {
    const queueItem = await this.findOne(queueId);
    
    if (queueItem.status !== 'waiting') {
      return;
    }
    
    // Count patients ahead in queue with higher priority or same priority but lower queue number
    let patientsAhead = 0;
    
    if (queueItem.priority === 'normal') {
      // Count all urgent patients + normal patients with lower queue numbers
      const urgentCount = await this.queueRepo.count({
        where: { 
          status: 'waiting',
          priority: 'urgent'
        }
      });
      
      const normalAhead = await this.queueRepo
        .createQueryBuilder('queue')
        .where('queue.status = :status', { status: 'waiting' })
        .andWhere('queue.priority = :priority', { priority: 'normal' })
        .andWhere('queue.queueNumber < :queueNumber', { queueNumber: queueItem.queueNumber })
        .getCount();
      
      patientsAhead = urgentCount + normalAhead;
    } else {
      // For urgent patients, only count urgent patients with lower queue numbers
      patientsAhead = await this.queueRepo
        .createQueryBuilder('queue')
        .where('queue.status = :status', { status: 'waiting' })
        .andWhere('queue.priority = :priority', { priority: 'urgent' })
        .andWhere('queue.queueNumber < :queueNumber', { queueNumber: queueItem.queueNumber })
        .getCount();
    }
    
    // Estimate 15 minutes per patient
    const estimatedWait = patientsAhead * 15;
    queueItem.estimatedWaitTime = estimatedWait;
    
    await this.queueRepo.save(queueItem);
  }

  private async updateAllEstimatedWaitTimes(): Promise<void> {
    const waitingItems = await this.queueRepo.find({
      where: { status: 'waiting' },
      order: { 
        priority: 'DESC',
        queueNumber: 'ASC' 
      }
    });
    
    for (let i = 0; i < waitingItems.length; i++) {
      waitingItems[i].estimatedWaitTime = i * 15; // 15 minutes per position
      await this.queueRepo.save(waitingItems[i]);
    }
  }
}
