// src/main.ts (Auth Server)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  await app.listen(3002); // Auth Server 포트 예시
  console.log(`Auth Server is running on: ${await app.getUrl()}`);
}
bootstrap();
