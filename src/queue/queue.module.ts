import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueEntity } from './queue.entity/queue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueEntity])
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
