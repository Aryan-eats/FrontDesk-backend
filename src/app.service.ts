import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'AlloFront Backend API - Running Successfully!';
  }

  async checkDatabaseConnection(): Promise<string> {
    try {
      // Simple query with timeout
      const result = await Promise.race([
        this.dataSource.query('SELECT 1 as connected'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]);
      
      return result ? 'connected' : 'disconnected';
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
}
