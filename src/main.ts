import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS to allow frontend to connect
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3001'),
    credentials: true,
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
