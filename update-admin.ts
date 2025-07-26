import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UserService } from './src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './src/user/user.entity/user.entity';
import { Repository } from 'typeorm';

async function updateAdmin() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    
    console.log('Updating admin user...');
    
    // Find the admin user and update the fullName
    const adminUser = await userRepository.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      console.log('Current admin user:', adminUser);
      
      // Update the user
      adminUser.fullName = 'Admin';
      const updatedUser = await userRepository.save(adminUser);
      
      console.log('Admin user updated successfully:', updatedUser);
    } else {
      console.log('Admin user not found');
    }
    
    await app.close();
  } catch (error) {
    console.error('Error updating admin user:', error);
  }
}

updateAdmin();
