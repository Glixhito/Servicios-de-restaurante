// 🇨🇴 Forzar zona horaria de Colombia en todo el servidor
process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // 🚨 AGREGADO: { rawBody: true } es vital para que la firma del Webhook de Nequi funcione
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // Seguridad
  app.use(helmet());

  // CORS nativo
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = 4000;
  await app.listen(port);
  console.log(`\n🚀 Servidor ejecutándose en puerto ${port} (Hora sincronizada: Colombia)`);
}
bootstrap();