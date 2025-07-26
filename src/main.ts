import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS to allow frontend to connect
  const allowedOrigins = [
    'http://localhost:3001',
    'https://allofront.vercel.app/',
    configService.get<string>('FRONTEND_URL'),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (allowedOrigins.some(allowedOrigin => 
        allowedOrigin === origin || 
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      )) {
        return callback(null, true);
      }
      
      // For production, be more permissive with Vercel apps
      if (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      return callback(null, true); // Be permissive for now
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Backend server running on http://localhost:${port}`);
}

// For serverless deployment
if (require.main === module) {
  bootstrap();
}

export default bootstrap;
