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
