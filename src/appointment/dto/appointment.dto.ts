export interface CreateAppointmentDto {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentTime: Date;
  doctorId: number;
  notes?: string;
}

export interface UpdateAppointmentDto {
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentTime?: Date;
  status?: 'booked' | 'completed' | 'canceled' | 'in-progress';
  notes?: string;
}
