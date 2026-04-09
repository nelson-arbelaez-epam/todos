import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './global-exception.filter';
import { getSharedFaviconDataUri } from './swagger-favicon';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Todos API')
    .setDescription('API for managing todos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase ID token obtained from the /auth/login endpoint',
      },
      'firebase-jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const sharedFavicon = getSharedFaviconDataUri();
  SwaggerModule.setup('api', app, document, {
    customfavIcon: sharedFavicon,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
