import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Dependiendo del banco, el header puede llamarse distinto. Asumimos 'x-signature'
    const signature = request.headers['x-signature'];

    if (!signature) {
      throw new UnauthorizedException('Signature ausente en webhook');
    }

    // Aquí es vital el rawBody que configuraremos en el main.ts más adelante
    const rawBody = request.rawBody || JSON.stringify(request.body);
    const secret = process.env.WEBHOOK_SECRET_NEQUI;

    if (!secret) {
      throw new UnauthorizedException('WEBHOOK_SECRET_NEQUI no configurado en entorno');
    }

    // Generamos la firma criptográfica esperada
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    let isValid = false;
    try {
      // crypto.timingSafeEqual previene "Timing Attacks" (ataques de medición de tiempo)
      isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.error(
        ` Firma webhook inválida. Esperado: ${expectedSignature}, Recibido: ${signature}`,
      );
      throw new UnauthorizedException('Firma de webhook inválida');
    }

    return true;
  }
}