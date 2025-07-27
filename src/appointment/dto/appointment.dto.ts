export interface CreateAppointmentDto {
  patientName: string;
  patientPhone?: string;
  appointmentTime: Date;
  doctorId: number;
}

export interface UpdateAppointmentDto {
  patientName?: string;
  patientPhone?: string;
  appointmentTime?: Date;
  status?: 'booked' | 'completed' | 'canceled';
}
