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
    
    // Check if admin user already exists
    const existingAdmin = await userService.getUserByUsername('admin');
    if (!existingAdmin) {
      await userService.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@frontdesk.com',
        fullName: 'Admin',
        role: 'admin'
      } as any);
      console.log(' Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Check if staff user already exists
    const existingStaff = await userService.getUserByUsername('staff');
    if (!existingStaff) {
      await userService.createUser({
        username: 'staff',
        password: await bcrypt.hash('staff123', salt),
        email: 'staff@frontdesk.com',
        fullName: 'Front Desk Staff',
        role: 'staff'
      } as any);
      console.log('Staff user created');
    } else {
      console.log('  Staff user already exists');
    }

    console.log('Creating doctors...');
    
    // Create doctors
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialization: 'General Practice',
        gender: 'Female',
        location: 'Room 101',
        email: 'sarah.johnson@clinic.com',
        phone: '555-123-4567',
        availability: JSON.stringify({
          monday: ['09:00-17:00'],
          tuesday: ['09:00-17:00'],
          wednesday: ['09:00-17:00'],
          thursday: ['09:00-17:00'],
          friday: ['09:00-15:00']
        })
      },
      {
        name: 'Dr. Michael Chen',
        specialization: 'Cardiology',
        gender: 'Male',
        location: 'Room 205',
        email: 'michael.chen@clinic.com',
        phone: '555-234-5678',
        availability: JSON.stringify({
          monday: ['10:00-18:00'],
          tuesday: ['10:00-18:00'],
          wednesday: ['10:00-18:00'],
          thursday: ['10:00-18:00'],
          friday: ['10:00-16:00']
        })
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pediatrics',
        gender: 'Female',
        location: 'Room 103',
        email: 'emily.rodriguez@clinic.com',
        phone: '555-345-6789',
        availability: JSON.stringify({
          monday: ['08:00-16:00'],
          tuesday: ['08:00-16:00'],
          wednesday: ['08:00-16:00'],
          thursday: ['08:00-16:00'],
          friday: ['08:00-14:00']
        })
      },
      {
        name: 'Dr. James Wilson',
        specialization: 'Dermatology',
        gender: 'Male',
        location: 'Room 301',
        email: 'james.wilson@clinic.com',
        phone: '555-456-7890',
        availability: JSON.stringify({
          tuesday: ['09:00-17:00'],
          wednesday: ['09:00-17:00'],
          thursday: ['09:00-17:00'],
          friday: ['09:00-17:00']
        })
      },
      {
        name: 'Dr. Lisa Thompson',
        specialization: 'Orthopedics',
        gender: 'Female',
        location: 'Room 210',
        email: 'lisa.thompson@clinic.com',
        phone: '555-567-8901',
        availability: JSON.stringify({
          monday: ['07:00-15:00'],
          wednesday: ['07:00-15:00'],
          friday: ['07:00-15:00']
        })
      }
    ];

    const createdDoctors: Doctor[] = [];
    for (const doctorData of doctors) {
      const doctor = await doctorService.createDoctor(doctorData);
      createdDoctors.push(doctor);
    }

    await doctorService.changeStatus(createdDoctors[2].id, 'busy');
    await doctorService.changeStatus(createdDoctors[4].id, 'off-duty');

    console.log('Creating queue items...');
    
    const queueItems = [
      {
        patientName: 'John Smith',
        patientPhone: '555-111-2222',
        doctorId: createdDoctors[0].id,
        priority: 'normal' as const
      },
      {
        patientName: 'Maria Garcia',
        patientPhone: '555-222-3333',
        doctorId: createdDoctors[1].id,
        priority: 'urgent' as const
      },
      {
        patientName: 'Robert Johnson',
        patientPhone: '555-333-4444',
        doctorId: createdDoctors[0].id,
        priority: 'normal' as const
      },
      {
        patientName: 'Jennifer Davis',
        patientPhone: '555-444-5555',
        priority: 'urgent' as const
      }
    ];

    for (const queueData of queueItems) {
      await queueService.addToQueue(queueData);
    }

    console.log('Creating appointments...');
    
    // Create some appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointments = [
      {
        patientName: 'Alice Brown',
        patientEmail: 'alice.brown@email.com',
        patientPhone: '+1 (555) 777-8888',
        appointmentTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        doctorId: createdDoctors[0].id,
        notes: 'Annual checkup'
      },
      {
        patientName: 'David Wilson',
        patientEmail: 'david.wilson@email.com',
        patientPhone: '+1 (555) 888-9999',
        appointmentTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
        doctorId: createdDoctors[1].id,
        notes: 'Follow-up consultation'
      },
      {
        patientName: 'Sarah Miller',
        patientEmail: 'sarah.miller@email.com',
        patientPhone: '+1 (555) 999-0000',
        appointmentTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
        doctorId: createdDoctors[2].id,
        notes: 'Pediatric consultation'
      },
      {
        patientName: 'Tom Anderson',
        patientEmail: 'tom.anderson@email.com',
        patientPhone: '+1 (555) 000-1111',
        appointmentTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 30),
        doctorId: createdDoctors[3].id,
        notes: 'Skin examination'
      }
    ];

    for (const appointmentData of appointments) {
      await appointmentService.createAppointment(appointmentData);
    }

    console.log('Database seeding completed successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Staff: username=staff, password=staff123');
    console.log('');
    console.log(`Created:`);
    console.log(`   - ${doctors.length} doctors`);
    console.log(`   - ${queueItems.length} queue items`);
    console.log(`   - ${appointments.length} appointments`);
    console.log(`   - 2 users (admin & staff)`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();
