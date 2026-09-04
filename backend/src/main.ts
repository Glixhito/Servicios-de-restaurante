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

  // CORS nativo optimizado para aceptar cualquier preview de Vercel y desarrollo local
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (como Postman o apps móviles)
      if (!origin) {
        return callback(null, true);
      }

      const frontendUrl = configService.get('FRONTEND_URL');
      
      // Permitir si es localhost, cualquier subdominio de Vercel, o la URL de producción exacta
      const isAllowed = 
        origin.includes('localhost') || 
        origin.endsWith('.vercel.app') || 
        (frontendUrl && origin === frontendUrl);

      if (isAllowed) {
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