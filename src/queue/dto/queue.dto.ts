export interface CreateQueueDto {
  patientName: string;
  patientPhone?: string;
  doctorId?: number;
}

export interface UpdateQueueDto {
  patientName?: string;
  patientPhone?: string;
  status?: 'waiting' | 'with-doctor' | 'completed';
}
