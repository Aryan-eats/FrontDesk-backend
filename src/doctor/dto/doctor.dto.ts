export interface CreateDoctorDto {
  name: string;
  specialization: string;
  gender: string;
  location: string;
  phone?: string;
  availability?: { day: string; startTime: string; endTime: string }[];
}

export interface UpdateDoctorDto {
  name?: string;
  specialization?: string;
  gender?: string;
  location?: string;
  phone?: string;
  availability?: { day: string; startTime: string; endTime: string }[];
  status?: 'available' | 'busy' | 'off-duty';
}
