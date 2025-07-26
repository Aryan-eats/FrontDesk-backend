import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let app: any;

const initializeApp = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    // Enable CORS
    app.enableCors({
      origin: configService.get('FRONTEND_URL') || 'http://localhost:3001',
      credentials: true,
    });
    
    await app.init();
  }
  return app;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await initializeApp();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
