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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.createDoctor(createDoctorDto);
  }

  @Get()
  findAll(@Query('specialization') specialization?: string, @Query('location') location?: string) {
    if (specialization || location) {
      return this.doctorService.searchDoctors(specialization, location);
    }
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.deleteDoctor(id);
  }
}
