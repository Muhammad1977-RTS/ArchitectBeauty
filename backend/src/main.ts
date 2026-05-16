import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SnakeCaseInterceptor } from './common/snake-case.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new SnakeCaseInterceptor());
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Backend running on http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
