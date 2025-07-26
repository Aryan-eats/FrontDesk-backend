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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('doctors')
@UseGuards(AuthGuard('jwt'))
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.createDoctor(createDoctorDto);
  }

  @Get()
  findAll() {
    return this.doctorService.getAllDoctors();
  }

  @Get('available')
  getAvailableDoctors() {
    return this.doctorService.getAvailableDoctors();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.getDoctorById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDoctorDto: UpdateDoctorDto
  ) {
    return this.doctorService.updateDoctor(id, updateDoctorDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'available' | 'busy' | 'off-duty'
  ) {
    return this.doctorService.changeStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.deleteDoctor(id);
  }
}
