import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PagoQR, TipoPagoQR, EstadoPagoQR } from '../entities/pago-qr.entity';
import { AuditoriaPago, AccionAuditoria } from '../entities/auditoria-pago.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';
import * as crypto from 'crypto';

@Injectable()
export class PagoQRService {
  constructor(
    @InjectRepository(PagoQR)
    private pagoQRRepository: Repository<PagoQR>,
    @InjectRepository(AuditoriaPago)
    private auditoriaRepository: Repository<AuditoriaPago>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async generarQRBreB(
    restaurante_id: string,
    pedido: Pedido,
    ip_cliente: string,
    user_agent: string,
  ): Promise<PagoQR> {
    try {
      if (!pedido || pedido.total <= 0) {
        throw new BadRequestException('Pedido inválido');
      }

      const referencia = this.generarReferencia(pedido.numero_pedido);
      const existente = await this.pagoQRRepository.findOne({ where: { referencia } });

      if (existente) {
        throw new BadRequestException('Referencia duplicada, intenta de nuevo');
      }

      const breB_data = this.construirBreB(restaurante_id, pedido.total, referencia);

      const pagoQR = this.pagoQRRepository.create({
        restaurante_id,
        pedido_id: pedido.id,
        tipo_pago: TipoPagoQR.BRE_B,
        estado: EstadoPagoQR.ESPERANDO_PAGO,
        monto: pedido.total,
        referencia,
        qr_data: breB_data,
        timestamp_creacion: new Date(),
        ip_cliente,
        user_agent,
        historico_intentos: ['QR Bre-B generado'],
      });

      const savedPagoQR = await this.pagoQRRepository.save(pagoQR);

      await this.registrarAuditoria(
        restaurante_id,
        savedPagoQR.id,
        AccionAuditoria.QR_CREADO,
        { referencia, monto: pedido.total, tipo: 'BRE_B' },
        ip_cliente,
        user_agent,
        true,
      );

      return savedPagoQR;
    } catch (error: any) {
      throw new InternalServerErrorException('Error generando QR Bre-B: ' + error.message);
    }
  }

  async generarQRNequi(
    restaurante_id: string,
    pedido: Pedido,
    ip_cliente: string,
    user_agent: string,
  ): Promise<PagoQR> {
    try {
      if (!pedido || pedido.total <= 0) {
        throw new BadRequestException('Pedido inválido');
      }

      const referencia = this.generarReferencia(pedido.numero_pedido);
      const existente = await this.pagoQRRepository.findOne({ where: { referencia } });

      if (existente) {
        throw new BadRequestException('Referencia duplicada');
      }

      const nequi_response = await this.generarQRNequiAPI(restaurante_id, pedido.total, referencia);

      const pagoQR = this.pagoQRRepository.create({
        restaurante_id,
        pedido_id: pedido.id,
        tipo_pago: TipoPagoQR.NEQUI,
        estado: EstadoPagoQR.ESPERANDO_PAGO,
        monto: pedido.total,
        referencia,
        qr_data: nequi_response.url,
        codigo_nequi: nequi_response.codigo,
        timestamp_creacion: new Date(),
        ip_cliente,
        user_agent,
        historico_intentos: ['QR Nequi generado'],
      });

      const savedPagoQR = await this.pagoQRRepository.save(pagoQR);

      await this.registrarAuditoria(
        restaurante_id,
        savedPagoQR.id,
        AccionAuditoria.QR_CREADO,
        { referencia, monto: pedido.total, tipo: 'NEQUI' },
        ip_cliente,
        user_agent,
        true,
      );

      return savedPagoQR;
    } catch (error: any) {
      throw new InternalServerErrorException('Error generando QR Nequi: ' + error.message);
    }
  }

  async validarPagoNequiWebhook(webhook_data: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const { referencia, monto, timestamp } = webhook_data;

      const pagoQR = (await queryRunner.manager.findOne(PagoQR, {
        where: { referencia },
        lock: { mode: 'pessimistic_write' },
      })) as PagoQR;

      if (!pagoQR) {
        throw new NotFoundException('Pago no encontrado');
      }

      if (pagoQR.estado !== EstadoPagoQR.ESPERANDO_PAGO) {
        throw new ConflictException(`Pago ya fue procesado. Estado: ${pagoQR.estado}`);
      }

      pagoQR.estado = EstadoPagoQR.VALIDANDO;
      pagoQR.id_transaccion_nequi = webhook_data.id_transaccion || null;
      pagoQR.timestamp_pago = new Date(timestamp);

      const auditoria1 = queryRunner.manager.create(AuditoriaPago, {
        restaurante_id: pagoQR.restaurante_id,
        pago_qr_id: pagoQR.id,
        accion: AccionAuditoria.WEBHOOK_RECIBIDO,
        detalles: JSON.stringify({ monto, referencia, timestamp }),
        exitoso: true,
      });
      await queryRunner.manager.save(auditoria1);

      const validaciones = await this.validarPagoEnCadena(pagoQR, monto);

      if (!validaciones.exitoso) {
        pagoQR.estado = EstadoPagoQR.ERROR_PAGO;
        pagoQR.error_message = validaciones.error || 'Error de validación desconocido';

        const auditoria2 = queryRunner.manager.create(AuditoriaPago, {
          restaurante_id: pagoQR.restaurante_id,
          pago_qr_id: pagoQR.id,
          accion: AccionAuditoria.VALIDACION_FALLIDA,
          detalles: JSON.stringify({ error: validaciones.error }),
          exitoso: false,
        });
        await queryRunner.manager.save(auditoria2);
        await queryRunner.manager.save(pagoQR);
        
        await queryRunner.commitTransaction();
        throw new BadRequestException(validaciones.error);
      }

      pagoQR.estado = EstadoPagoQR.PAGADO;
      pagoQR.timestamp_confirmacion = new Date();

      const auditoria3 = queryRunner.manager.create(AuditoriaPago, {
        restaurante_id: pagoQR.restaurante_id,
        pago_qr_id: pagoQR.id,
        accion: AccionAuditoria.PAGO_CONFIRMADO,
        monto: pagoQR.monto,
        referencia: pagoQR.referencia,
        detalles: JSON.stringify({ monto, referencia }),
        exitoso: true,
      });

      await queryRunner.manager.save(auditoria3);
      await queryRunner.manager.save(pagoQR);

      const pedido = await queryRunner.manager.findOne(Pedido, {
        where: { id: pagoQR.pedido_id },
      });

      if (pedido) {
        (pedido as any).pago_verificado = true;
        (pedido as any).estado = 'CONFIRMADO';
        await queryRunner.manager.save(pedido);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async hacerPollingPago(pago_qr_id: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const pagoQR = (await queryRunner.manager.findOne(PagoQR, {
        where: { id: pago_qr_id },
        lock: { mode: 'pessimistic_write' },
      })) as PagoQR;

      if (!pagoQR) {
        throw new NotFoundException('Pago no encontrado');
      }

      if (pagoQR.estado === EstadoPagoQR.PAGADO) {
        await queryRunner.commitTransaction();
        return true;
      }

      const ahora = new Date();
      const tiempoTranscurrido = (ahora.getTime() - new Date(pagoQR.timestamp_creacion).getTime()) / 1000;
      const TIMEOUT = 300;

      if (tiempoTranscurrido > TIMEOUT) {
        pagoQR.estado = EstadoPagoQR.CANCELADO;
        pagoQR.error_message = 'Timeout: Pago no verificado en 5 minutos';

        const auditoria = queryRunner.manager.create(AuditoriaPago, {
          restaurante_id: pagoQR.restaurante_id,
          pago_qr_id: pagoQR.id,
          accion: AccionAuditoria.ERROR_SISTEMA,
          detalles: JSON.stringify({ error: 'Timeout' }),
          exitoso: false,
        });

        await queryRunner.manager.save(auditoria);
        await queryRunner.manager.save(pagoQR);
        await queryRunner.commitTransaction();
        return false;
      }

      const pago_confirmado = await this.verificarEnBanco(pagoQR.referencia, pagoQR.monto);

      if (pago_confirmado) {
        pagoQR.estado = EstadoPagoQR.PAGADO;
        pagoQR.timestamp_confirmacion = new Date();

        const auditoria = queryRunner.manager.create(AuditoriaPago, {
          restaurante_id: pagoQR.restaurante_id,
          pago_qr_id: pagoQR.id,
          accion: AccionAuditoria.POLLING_EJECUTADO,
          detalles: JSON.stringify({ resultado: 'Pago encontrado' }),
          exitoso: true,
        });

        await queryRunner.manager.save(auditoria);
        await queryRunner.manager.save(pagoQR);
        await queryRunner.commitTransaction();
        return true;
      }

      pagoQR.intentos++;
      if (!pagoQR.historico_intentos) pagoQR.historico_intentos = [];
      pagoQR.historico_intentos.push(`Polling ${pagoQR.intentos} - ${new Date().toISOString()}`);

      const auditoria = queryRunner.manager.create(AuditoriaPago, {
        restaurante_id: pagoQR.restaurante_id,
        pago_qr_id: pagoQR.id,
        accion: AccionAuditoria.POLLING_EJECUTADO,
        detalles: JSON.stringify({ intento: pagoQR.intentos }),
        exitoso: false,
      });

      await queryRunner.manager.save(auditoria);
      await queryRunner.manager.save(pagoQR);
      await queryRunner.commitTransaction();

      return false;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reintentarPago(
    pago_qr_anterior_id: string,
    ip_cliente: string,
    user_agent: string,
  ): Promise<PagoQR> {
    const pagoAnterior = await this.pagoQRRepository.findOne({
      where: { id: pago_qr_anterior_id },
    });

    if (!pagoAnterior) {
      throw new NotFoundException('Pago anterior no encontrado');
    }

    if (pagoAnterior.intentos >= 3) {
      throw new BadRequestException('Máximo de reintentos alcanzado. Contacta soporte.');
    }

    pagoAnterior.estado = EstadoPagoQR.CANCELADO;
    pagoAnterior.error_message = 'Usuario reintentó con nuevo QR';
    await this.pagoQRRepository.save(pagoAnterior);

    const pedido = await this.dataSource.getRepository(Pedido).findOne({
      where: { id: pagoAnterior.pedido_id },
    });

    if (!pedido) {
      throw new NotFoundException('El pedido asociado no fue encontrado');
    }

    if (pagoAnterior.tipo_pago === TipoPagoQR.BRE_B) {
      return await this.generarQRBreB(pagoAnterior.restaurante_id, pedido, ip_cliente, user_agent);
    } else {
      return await this.generarQRNequi(pagoAnterior.restaurante_id, pedido, ip_cliente, user_agent);
    }
  }

  async obtenerEstadoPago(pago_qr_id: string): Promise<PagoQR> {
    const pagoQR = await this.pagoQRRepository.findOne({ where: { id: pago_qr_id } });
    if (!pagoQR) throw new NotFoundException('Pago no encontrado');
    return pagoQR;
  }

  private generarReferencia(numero_pedido: number): string {
    const fecha = new Date();
    const fecha_str = fecha.toISOString().split('T')[0].replace(/-/g, '');
    const unico = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `PED-${fecha_str}-${numero_pedido}-${unico}`;
  }

  private construirBreB(restaurante_id: string, monto: number, referencia: string): string {
    const version = '00020126';
    const funcion = '360014';
    const nombreComercio = 'RESTAURANTE-' + restaurante_id.substring(0, 8);
    const montoFormato = monto.toString().padStart(12, '0');
    const referencia_formato = referencia.padEnd(40, ' ');
    return `${version}${funcion}${nombreComercio}${montoFormato}${referencia_formato}`;
  }

  private async generarQRNequiAPI(
    restaurante_id: string,
    monto: number,
    referencia: string,
  ): Promise<{ url: string; codigo: string }> {
    return {
      url: `https://nequi.com/qr/${referencia}`,
      codigo: `NEQ-${referencia}`,
    };
  }

  private async registrarAuditoria(
    restaurante_id: string,
    pago_qr_id: string,
    accion: AccionAuditoria,
    detalles: any,
    ip: string,
    user_agent: string,
    exitoso: boolean,
  ): Promise<void> {
    try {
      const auditoria = this.auditoriaRepository.create({
        restaurante_id,
        pago_qr_id,
        accion,
        detalles: JSON.stringify(detalles),
        ip,
        user_agent,
        exitoso,
      });
      await this.auditoriaRepository.save(auditoria);
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }

  private async validarPagoEnCadena(
    pagoQR: PagoQR,
    monto_transferencia: number,
  ): Promise<{ exitoso: boolean; error?: string }> {
    if (monto_transferencia !== pagoQR.monto) {
      return {
        exitoso: false,
        error: `Monto incorrecto. Esperado: ${pagoQR.monto}, Recibido: ${monto_transferencia}`,
      };
    }
    if (!pagoQR.referencia) {
      return { exitoso: false, error: 'Referencia inválida' };
    }
    return { exitoso: true };
  }

  private async verificarEnBanco(referencia: string, monto: number): Promise<boolean> {
    return false;
  }
}