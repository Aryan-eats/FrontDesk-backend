import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateQueueDto {
  @IsString()
  patientName: string;

  @IsOptional()
  @IsString()
  patientPhone?: string;

  @IsOptional()
  @IsNumber()
  doctorId?: number;

  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  priority?: 'normal' | 'urgent';
}

export class UpdateQueueDto {
  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsString()
  patientPhone?: string;

  @IsOptional()
  @IsEnum(['waiting', 'with-doctor', 'completed', 'canceled'])
  status?: 'waiting' | 'with-doctor' | 'completed' | 'canceled';

  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  priority?: 'normal' | 'urgent';

  @IsOptional()
  @IsNumber()
  estimatedWaitTime?: number;
}
