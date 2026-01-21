import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });
  const configService = app.get(ConfigService);
  const CLIENT_URL =
    configService.get<string>('NODE_ENV') === 'production'
      ? configService.get<string>('CLIENT_URL')
      : 'http://localhost:5173';
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const allowedOrigins = [
    'https://frontend-eight-black-75.vercel.app', // production
    'http://localhost:5173', // dev
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Scholar Ai Project API')
    .setDescription('API documentation for backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('/api-docs', app, swaggerDocument);

  // Start server
  const port = process.env.PORT ?? 3000;
  console.log('Port:', port);
  await app.listen(port);
  console.log(`🚀 Server running on ${CLIENT_URL}`);
  console.log(`📘 Swagger docs available at ${CLIENT_URL}/api-docs`);
}
bootstrap();
