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
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto, UpdateQueueDto } from './dto/queue.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.addToQueue(createQueueDto);
  }

  @Get()
  findAll() {
    return this.queueService.getAllQueue();
  }

  @Get('today')
  getTodayQueue() {
    return this.queueService.getTodayQueue();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.getQueueById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateQueueDto: UpdateQueueDto
  ) {
    return this.queueService.updateQueue(id, updateQueueDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.deleteQueue(id);
  }
}
