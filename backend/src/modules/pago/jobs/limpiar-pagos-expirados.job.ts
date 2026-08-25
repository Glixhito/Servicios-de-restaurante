import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PagoQR, EstadoPagoQR } from '../entities/pago-qr.entity';
import { AuditoriaPago, AccionAuditoria } from '../entities/auditoria-pago.entity';

@Injectable()
export class LimpiarPagosExpiradosJob {
  private readonly logger = new Logger(LimpiarPagosExpiradosJob.name);

  constructor(
    @InjectRepository(PagoQR)
    private pagoQRRepository: Repository<PagoQR>,
    @InjectRepository(AuditoriaPago)
    private auditoriaRepository: Repository<AuditoriaPago>,
  ) {}

  /**
   * Ejecutar cada minuto
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async limpiarPagosExpirados() {
    try {
      const TIMEOUT = 300; // 5 minutos en segundos
      const ahora = new Date();
      // Calculamos la fecha y hora de hace 5 minutos
      const hace5min = new Date(ahora.getTime() - TIMEOUT * 1000);

      const pagosExpirados = await this.pagoQRRepository.find({
        where: {
          estado: EstadoPagoQR.ESPERANDO_PAGO,
          timestamp_creacion: LessThan(hace5min),
        },
      });

      if (pagosExpirados.length === 0) {
        return; // No hay nada que limpiar, terminamos en silencio
      }

      this.logger.log(`🧹 Limpiando ${pagosExpirados.length} pagos expirados...`);

      for (const pago of pagosExpirados) {
        pago.estado = EstadoPagoQR.CANCELADO;
        pago.error_message = 'Timeout automático (5 minutos sin pago)';

        await this.pagoQRRepository.save(pago);

        // Dejamos rastro en la auditoría
        const auditoria = this.auditoriaRepository.create({
          restaurante_id: pago.restaurante_id,
          pago_qr_id: pago.id,
          accion: AccionAuditoria.ERROR_SISTEMA,
          referencia: pago.referencia,
          monto: pago.monto,
          detalles: JSON.stringify({
            tipo: 'Limpieza automática',
            razon: 'Timeout de 5 minutos',
            timestamp_creacion: pago.timestamp_creacion,
            timestamp_limpieza: new Date(),
          }),
          exitoso: false,
        });

        await this.auditoriaRepository.save(auditoria);
      }

      this.logger.log(`✅ ${pagosExpirados.length} pagos marcados como CANCELADO.`);
    } catch (error) {
      this.logger.error(' Error limpiando pagos expirados:', error);
    }
  }
}