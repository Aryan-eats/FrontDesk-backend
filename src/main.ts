import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS to allow frontend to connect
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3001'),
    credentials: true,
  });
  
  const port = configService.get<number>('PORT', 3000);
  
  // For Vercel deployment
  if (process.env.VERCEL) {
    await app.init();
    return app;
  }
  
  // For local development
  await app.listen(port);
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`Database: ${configService.get<string>('DB_DATABASE', 'front_desk')}`);
  console.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

// Export for Vercel
export default bootstrap();

bootstrap();
