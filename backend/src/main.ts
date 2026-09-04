// 🇨🇴 Forzar zona horaria de Colombia en todo el servidor
process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // 🚨 { rawBody: true } es vital para que la firma del Webhook de Nequi funcione
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // Seguridad
  app.use(helmet());

  // CORS nativo optimizado para producción y desarrollo
  const allowedOrigins = [
    'https://sistema-pedidos-p2o8.vercel.app',
    'http://localhost:5173',
    configService.get('FRONTEND_URL'),
  ].filter(Boolean); // Filtra valores nulos o indefinidos

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (como Postman o apps móviles)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por la política CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
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

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n🚀 Servidor ejecutándose en puerto ${port} (Hora sincronizada: Colombia)`);
}
bootstrap();