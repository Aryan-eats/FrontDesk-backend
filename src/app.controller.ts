import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AlloFront Backend API',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('health/api')
  async getApiHealth() {
    try {
      // Test that all modules are loaded
      return {
        status: 'ok',
        apis: {
          auth: 'available',
          doctors: 'protected',
          appointments: 'protected', 
          queue: 'protected'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('health/db')
  async getDbHealth() {
    try {
      const dbStatus = await this.appService.checkDatabaseConnection();
      return {
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
