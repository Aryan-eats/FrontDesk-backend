import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UserService } from './src/user/user.service';
import { DataSource } from 'typeorm';
import { UserEntity } from './src/user/user.entity/user.entity';

async function updateAdminName() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);
  const dataSource = app.get(DataSource);

  try {
    console.log('Updating admin user name...');
    
    // Find the admin user
    const adminUser = await userService.getUserByUsername('admin');
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log('Current admin user:', adminUser);
    
    // Update the admin user's fullName using DataSource
    const userRepository = dataSource.getRepository(UserEntity);
    await userRepository.update(adminUser.id, {
      fullName: 'Admin'
    });
    
    console.log('Admin user name updated successfully to "Admin"');
    
    // Verify the update
    const updatedUser = await userService.getUserByUsername('admin');
    console.log('Updated admin user:', updatedUser);
    
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await app.close();
  }
}

updateAdminName();
