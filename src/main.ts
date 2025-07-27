import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });
    const configService = app.get(ConfigService);
    
    // Enable validation pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // Enable CORS to allow frontend to connect
    app.enableCors({
      origin: [
        'http://localhost:3001',
        'https://allofront.vercel.app',
        'https://frontdesk-sigma.vercel.app',
        configService.get<string>('FRONTEND_URL', 'http://localhost:3001')
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    
    await app.init();
  }
  return app;
}

// For local development
async function startLocal() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3001'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Backend server running on http://localhost:${port}`);
}

// Serverless handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

// For local development
if (require.main === module) {
  startLocal();
}
