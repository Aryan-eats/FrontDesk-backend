export interface CreateDoctorDto {
  name: string;
  specialization: string;
  gender: string;
  location: string;
  email?: string;
  phone?: string;
  availability?: string;
}

export interface UpdateDoctorDto {
  name?: string;
  specialization?: string;
  gender?: string;
  location?: string;
  email?: string;
  phone?: string;
  availability?: string;
  status?: 'available' | 'busy' | 'off-duty';
}
