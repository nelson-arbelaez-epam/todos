import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter, getSharedFaviconDataUri } from '@todos/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api/v1', { exclude: ['mcp'] });

  const config = new DocumentBuilder()
    .setTitle('Todos MCP API')
    .setDescription('MCP API for managing todos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const sharedFavicon = getSharedFaviconDataUri();
  SwaggerModule.setup('api', app, document, {
    customfavIcon: sharedFavicon,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
