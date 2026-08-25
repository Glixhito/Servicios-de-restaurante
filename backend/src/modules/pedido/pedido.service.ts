import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { Producto } from '../producto/entities/producto.entity';
import { ZonaDomicilio } from '../zona-domicilio/entities/zona-domicilio.entity';
import { PagoQR, TipoPagoQR } from '../pago/entities/pago-qr.entity';
import { PagoQRService } from '../pago/services/pago-qr.service';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(ZonaDomicilio)
    private zonaRepository: Repository<ZonaDomicilio>,
    @InjectRepository(PagoQR)
    private pagoQRRepository: Repository<PagoQR>,
    private pagoQRService: PagoQRService,
    private dataSource: DataSource,
  ) {}

  async obtenerPorId(id: string, restaurante_id: string): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id, restaurante_id },
      relations: ['detalles', 'detalles.producto', 'zona', 'pago_qr'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return pedido;
  }

  async crearPedido(
    restaurante_id: string,
    cliente_id: string,
    dto: any,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar zona de domicilio desde el objeto anidado dto.entrega
      const zona = await this.zonaRepository.findOne({
        where: { id: dto.entrega?.zona_id, restaurante_id },
      });
      if (!zona) {
        throw new BadRequestException('Zona de domicilio inválida');
      }

      // 2. Calcular subtotal recorriendo el carrito (dto.carrito)
      let subtotal = 0;
      const detallesEntidades: DetallePedido[] = [];

      const itemsCarrito = dto.carrito || [];
      for (const item of itemsCarrito) {
        const producto = await this.productoRepository.findOne({
          where: { id: item.producto_id, restaurante_id },
        });

        if (!producto || !producto.disponible) {
          throw new BadRequestException(`Producto no disponible o no encontrado`);
        }

        const precioTotalItem = producto.precio * item.cantidad;
        subtotal += precioTotalItem;

        const detalle = queryRunner.manager.create(DetallePedido, {
          producto_id: producto.id,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          subtotal: precioTotalItem,
          observaciones: item.observaciones || '',
        });
        detallesEntidades.push(detalle);
      }

      const tarifa_domicilio = Number(zona.tarifa);
      const total = subtotal + tarifa_domicilio;
      const numero_pedido = Math.floor(100000 + Math.random() * 900000);

      // 3. Mapear los datos estructurados protegiendo la dirección con un valor por defecto
      const nuevoPedido = queryRunner.manager.create(Pedido, {
        restaurante_id,
        cliente_id,
        numero_pedido,
        direccion: dto.entrega?.direccion || 'Dirección no especificada', // 🛡️ Evita el error null-value en la DB
        zona_domicilio_id: zona.id,
        referencia: dto.entrega?.referencia,
        instrucciones: dto.entrega?.instrucciones,
        metodo_pago: dto.pago?.metodo || TipoPagoQR.EFECTIVO,
        subtotal,
        tarifa_domicilio,
        total,
        estado: EstadoPedido.PENDIENTE,
        detalles: detallesEntidades,
      });

      const pedidoGuardado = await queryRunner.manager.save(nuevoPedido);

      // 4. Si el pago es Nequi o Bre-B, generar el QR automáticamente
      let pagoQR = null;
      const metodoPago = dto.pago?.metodo;
      if (metodoPago === TipoPagoQR.NEQUI || metodoPago === TipoPagoQR.BRE_B) {
        if (metodoPago === TipoPagoQR.NEQUI) {
          pagoQR = await this.pagoQRService.generarQRNequi(restaurante_id, pedidoGuardado, ip, userAgent);
        } else {
          pagoQR = await this.pagoQRService.generarQRBreB(restaurante_id, pedidoGuardado, ip, userAgent);
        }
      }

      await queryRunner.commitTransaction();

      return {
        exito: true,
        pedido: pedidoGuardado,
        pago_qr: pagoQR,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}