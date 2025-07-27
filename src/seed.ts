import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { DoctorService } from './doctor/doctor.service';
import { QueueService } from './queue/queue.service';
import { AppointmentService } from './appointment/appointment.service';
import { Doctor } from './doctor/doctor.entity/doctor.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);
  const doctorService = app.get(DoctorService);
  const queueService = app.get(QueueService);
  const appointmentService = app.get(AppointmentService);

  try {
    console.log('Starting database seeding...');

    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    try {
      await userService.createUser({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Front Desk Admin',
        role: 'front-desk'
      } as any);
      console.log('✓ Admin user created');
    } catch (error) {
      console.log('Admin user already exists or error creating');
    }

    console.log('Creating doctors...');
    
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialization: 'General Practice',
        gender: 'Female',
        location: 'Building A, Room 101',
        phone: '555-123-4567',
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '15:00' }
        ]
      },
      {
        name: 'Dr. Michael Chen',
        specialization: 'Cardiology',
        gender: 'Male',
        location: 'Building B, Room 205',
        phone: '555-234-5678',
        availability: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' }
        ]
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pediatrics',
        gender: 'Female',
        location: 'Building A, Room 103',
        phone: '555-345-6789',
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
          { day: 'Friday', startTime: '08:00', endTime: '14:00' }
        ]
      },
      {
        name: 'Dr. James Wilson',
        specialization: 'Dermatology',
        gender: 'Male',
        location: 'Building C, Room 301',
        phone: '555-456-7890',
        availability: [
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ]
      },
      {
        name: 'Dr. Lisa Thompson',
        specialization: 'Orthopedics',
        gender: 'Female',
        location: 'Building B, Room 210',
        phone: '555-567-8901',
        availability: [
          { day: 'Monday', startTime: '07:00', endTime: '15:00' },
          { day: 'Wednesday', startTime: '07:00', endTime: '15:00' },
          { day: 'Friday', startTime: '07:00', endTime: '15:00' }
        ]
      }
    ];

    const createdDoctors: Doctor[] = [];
    for (const doctorData of doctors) {
      try {
        const doctor = await doctorService.createDoctor(doctorData);
        createdDoctors.push(doctor);
        console.log(`✓ Created doctor: ${doctor.name}`);
      } catch (error) {
        console.log(`Doctor ${doctorData.name} already exists or error creating`);
      }
    }

    if (createdDoctors.length > 2) {
      await doctorService.updateDoctor(createdDoctors[2].id, { status: 'busy' });
    }
    if (createdDoctors.length > 4) {
      await doctorService.updateDoctor(createdDoctors[4].id, { status: 'off-duty' });
    }

    console.log('Creating queue items...');
    
    const queueItems = [
      {
        patientName: 'John Smith',
        patientPhone: '555-111-2222',
        doctorId: createdDoctors[0]?.id
      },
      {
        patientName: 'Maria Garcia',
        patientPhone: '555-222-3333',
        doctorId: createdDoctors[1]?.id
      },
      {
        patientName: 'Robert Johnson',
        patientPhone: '555-333-4444',
        doctorId: createdDoctors[0]?.id
      },
      {
        patientName: 'Jennifer Davis',
        patientPhone: '555-444-5555'
      }
    ];

    for (const queueData of queueItems) {
      try {
        await queueService.addToQueue(queueData);
        console.log(`✓ Created queue item for: ${queueData.patientName}`);
      } catch (error) {
        console.log(`Error creating queue item for ${queueData.patientName}`);
      }
    }

    console.log('Creating appointments...');
    
    const today = new Date();
    
    const appointments = [
      {
        patientName: 'Alice Brown',
        patientPhone: '555-777-8888',
        appointmentTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        doctorId: createdDoctors[0]?.id
      },
      {
        patientName: 'David Wilson',
        patientPhone: '555-888-9999',
        appointmentTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
        doctorId: createdDoctors[1]?.id
      },
      {
        patientName: 'Sarah Miller',
        patientPhone: '555-999-0000',
        appointmentTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
        doctorId: createdDoctors[2]?.id
      },
      {
        patientName: 'Tom Anderson',
        patientPhone: '555-000-1111',
        appointmentTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        doctorId: createdDoctors[3]?.id
      }
    ];

    for (const appointmentData of appointments) {
      try {
        await appointmentService.createAppointment(appointmentData);
        console.log(`✓ Created appointment for: ${appointmentData.patientName}`);
      } catch (error) {
        console.log(`Error creating appointment for ${appointmentData.patientName}`);
      }
    }

    console.log('\n Database seeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\nCreated:');
    console.log(`   - ${doctors.length} doctors`);
    console.log(`   - ${queueItems.length} queue items`);
    console.log(`   - ${appointments.length} appointments`);
    console.log(`   - 1 admin user`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();
