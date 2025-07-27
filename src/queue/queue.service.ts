import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntity } from './queue.entity/queue.entity';
import { CreateQueueDto, UpdateQueueDto } from './dto/queue.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntity)
    private queueRepo: Repository<QueueEntity>,
  ) {}

  async addToQueue(queueData: CreateQueueDto): Promise<QueueEntity> {
    const lastQueue = await this.queueRepo.findOne({
      where: {},
      order: { queueNumber: 'DESC' }
    });
    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    const queueItem = this.queueRepo.create({
      ...queueData,
      queueNumber,
    });

    return this.queueRepo.save(queueItem);
  }

  async getAllQueue(): Promise<QueueEntity[]> {
    return this.queueRepo.find({
      relations: ['doctor'],
      order: { queueNumber: 'ASC' }
    });
  }

  async getQueueById(id: number): Promise<QueueEntity> {
    const queueItem = await this.queueRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });
    
    if (!queueItem) {
      throw new NotFoundException(`Queue item with ID ${id} not found`);
    }
    
    return queueItem;
  }

  async updateQueue(id: number, updates: UpdateQueueDto): Promise<QueueEntity> {
    const queueItem = await this.getQueueById(id);
    Object.assign(queueItem, updates);
    return this.queueRepo.save(queueItem);
  }

  async deleteQueue(id: number): Promise<void> {
    const queueItem = await this.getQueueById(id);
    await this.queueRepo.remove(queueItem);
  }

  async getTodayQueue(): Promise<QueueEntity[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    return this.queueRepo.createQueryBuilder('queue')
      .leftJoinAndSelect('queue.doctor', 'doctor')
      .where('queue.arrivalTime BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay
      })
      .orderBy('queue.queueNumber', 'ASC')
      .getMany();
  }
}
