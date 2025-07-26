import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto, UpdateQueueDto } from './dto/queue.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('queue')
@UseGuards(AuthGuard('jwt'))
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.addToQueue(createQueueDto);
  }

  @Get()
  findAll(@Query('doctorId') doctorId?: string) {
    if (doctorId) {
      return this.queueService.getByDoctor(+doctorId);
    }
    return this.queueService.findAll();
  }

  @Get('waiting')
  getWaitingQueue() {
    return this.queueService.getWaitingQueue();
  }

  @Post('call-next')
  callNext(@Body('doctorId') doctorId?: number) {
    return this.queueService.callNext(doctorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateQueueDto: UpdateQueueDto
  ) {
    return this.queueService.update(id, updateQueueDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'waiting' | 'with-doctor' | 'completed' | 'canceled'
  ) {
    console.log(`Queue Controller: Updating status for ID ${id} to ${status}`);
    
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    
    const validStatuses = ['waiting', 'with-doctor', 'completed', 'canceled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    try {
      const result = await this.queueService.update(id, { status });
      console.log(`Queue Controller: Successfully updated status for ID ${id}`, result);
      return result;
    } catch (error) {
      console.error(`Queue Controller: Error updating status for ID ${id}:`, error);
      throw error;
    }
  }

  @Patch(':id/complete')
  completePatient(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.completePatient(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.remove(id);
  }
}
