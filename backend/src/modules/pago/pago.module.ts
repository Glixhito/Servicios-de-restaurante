import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoQR } from './entities/pago-qr.entity';
import { AuditoriaPago } from './entities/auditoria-pago.entity';
import { PagoQRService } from './services/pago-qr.service';
import { LimpiarPagosExpiradosJob } from './jobs/limpiar-pagos-expirados.job';
import { PagoController } from './pago.controller';
import { PedidoModule } from '../pedido/pedido.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PagoQR, AuditoriaPago]),
    PedidoModule, // Importamos esto para poder buscar los pedidos en el controlador
  ],
  controllers: [PagoController],
  providers: [PagoQRService, LimpiarPagosExpiradosJob],
  exports: [PagoQRService],
})
export class PagoModule {}