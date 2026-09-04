import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from './entities/historial-estado-pedido.entity';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { ProductoModule } from '../producto/producto.module';
import { ZonaDomicilioModule } from '../zona-domicilio/zona-domicilio.module';
import { ClienteModule } from '../cliente/cliente.module';
import { PagoModule } from '../pago/pago.module';

import { Cliente } from '../cliente/entities/cliente.entity';
import { Producto } from '../producto/entities/producto.entity';
import { ProductoPorcion } from '../producto/entities/producto-porcion.entity'; // 💡 1. Importar la entidad de porciones
import { PagoQR } from '../pago/entities/pago-qr.entity';
import { ZonaDomicilio } from '../zona-domicilio/entities/zona-domicilio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      DetallePedido,
      HistorialEstadoPedido,
      PagoQR,
      Cliente,
      Producto,
      ProductoPorcion, // 💡 2. Registrar el repositorio aquí para que el servicio pueda usarlo
      ZonaDomicilio,
    ]),
    ProductoModule,
    ZonaDomicilioModule,
    ClienteModule,
    forwardRef(() => PagoModule),
  ],
  providers: [PedidoService],
  controllers: [PedidoController],
  exports: [PedidoService],
})
export class PedidoModule {}