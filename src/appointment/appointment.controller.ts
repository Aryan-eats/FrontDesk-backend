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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(createAppointmentDto);
  }

  @Get()
  findAll(
    @Query('doctorId') doctorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (doctorId) {
      return this.appointmentService.getAppointmentsByDoctor(+doctorId);
    }
    
    if (startDate && endDate) {
      return this.appointmentService.getAppointmentsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    }
    
    return this.appointmentService.getAllAppointments();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getAppointmentById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ) {
    return this.appointmentService.updateAppointment(id, updateAppointmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.deleteAppointment(id);
  }
}
