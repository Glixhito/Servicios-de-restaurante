import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Restaurante } from '../modules/restaurante/entities/restaurante.entity';
import { Categoria } from '../modules/categoria/entities/categoria.entity';
import { Producto } from '../modules/producto/entities/producto.entity';
import { ZonaDomicilio } from '../modules/zona-domicilio/entities/zona-domicilio.entity';
import { Cliente } from '../modules/cliente/entities/cliente.entity';
// ⬇️ REEMPLAZAMOS EL PAGO VIEJO POR NUESTRAS NUEVAS ENTIDADES PRO
import { PagoQR } from '../modules/pago/entities/pago-qr.entity';
import { AuditoriaPago } from '../modules/pago/entities/auditoria-pago.entity';
import { Pedido } from '../modules/pedido/entities/pedido.entity';
import { DetallePedido } from '../modules/pedido/entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from '../modules/pedido/entities/historial-estado-pedido.entity';
import { Administrador } from '../modules/auth/entities/administrador.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [
    Restaurante,
    Categoria,
    Producto,
    ZonaDomicilio,
    Cliente,
    PagoQR,      // ⬅️ NUEVA ENTIDAD
    AuditoriaPago, // ⬅️ NUEVA ENTIDAD DE AUDITORÍA
    Pedido,
    DetallePedido,
    HistorialEstadoPedido,
    Administrador,
  ],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
});