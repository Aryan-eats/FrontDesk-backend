export interface CreateQueueDto {
  patientName: string;
  patientPhone?: string;
  doctorId?: number;
  priority?: 'normal' | 'urgent';
}

export interface UpdateQueueDto {
  patientName?: string;
  patientPhone?: string;
  status?: 'waiting' | 'with-doctor' | 'completed' | 'canceled';
  priority?: 'normal' | 'urgent';
  estimatedWaitTime?: number;
}
