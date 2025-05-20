// src/main.ts (Auth Server)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as csurf from 'csurf';
import { ValidationPipe } from '@nestjs/common';
import settings from './settings';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(settings().corsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.use(cookieParser());

  app.use(
    '/',
    csurf({
      cookie: { key: 'csrftoken' },
      ignoreMethods: [
        'GET',
        'HEAD',
        'OPTIONS',
        'DELETE',
        'PATCH',
        'PUT',
        'POST',
      ],
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Auth Server')
    .setDescription('Auth Server')
    .setVersion('1.0')
    .addServer('http://localhost:3002/', 'Local environment')
    .addBearerAuth()
    .addTag('Your API Tag')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3002); // Auth Server 포트 예시
  console.log(`Auth Server is running on: ${await app.getUrl()}`);
}
bootstrap();
