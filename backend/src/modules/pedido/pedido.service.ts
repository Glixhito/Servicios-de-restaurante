import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { Producto } from '../producto/entities/producto.entity';
import { ProductoPorcion } from '../producto/entities/producto-porcion.entity';
import { ZonaDomicilio } from '../zona-domicilio/entities/zona-domicilio.entity';
import { PagoQR, TipoPagoQR } from '../pago/entities/pago-qr.entity';
import { PagoQRService } from '../pago/services/pago-qr.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(ProductoPorcion)
    private porcionRepository: Repository<ProductoPorcion>,
    @InjectRepository(ZonaDomicilio)
    private zonaRepository: Repository<ZonaDomicilio>,
    @InjectRepository(PagoQR)
    private pagoQRRepository: Repository<PagoQR>,
    private pagoQRService: PagoQRService,
    private dataSource: DataSource,
  ) {}

  async obtenerPorId(idOFigura: string, restaurante_id: string): Promise<any> {
    const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOFigura);

    const whereCondition: any = { restaurante_id };
    if (esUuid) {
      whereCondition.id = idOFigura;
    } else {
      whereCondition.numero_pedido = Number(idOFigura);
    }

    const pedido = await this.pedidoRepository.findOne({
      where: whereCondition,
      relations: ['cliente', 'detalles', 'detalles.producto', 'detalles.productoPorcion', 'zona'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return {
      ...pedido,
      zona_nombre: pedido.zona?.nombre || 'Pago al repartidor',
      monto: pedido.total,
      total_pagado: pedido.total,
    };
  }

  async obtenerPorRestaurante(restaurante_id: string, estado?: string) {
    const whereCondition: any = { restaurante_id };

    if (estado && estado !== 'TODOS' && estado !== 'Todos') {
      whereCondition.estado = estado;
    }

    return await this.pedidoRepository.find({
      where: whereCondition,
      relations: ['cliente', 'detalles', 'detalles.producto', 'detalles.productoPorcion', 'zona'],
      order: { created_at: 'DESC' },
    });
  }

  async cambiarEstado(id: string, restaurante_id: string, nuevoEstado: string) {
    const pedido = await this.obtenerPorId(id, restaurante_id);
    pedido.estado = nuevoEstado as EstadoPedido;
    return await this.pedidoRepository.save(pedido);
  }

  async confirmarPagoEfectivo(id: string, restaurante_id: string) {
    const pedido = await this.obtenerPorId(id, restaurante_id);
    pedido.pago_efectivo_recibido = true;
    return await this.pedidoRepository.save(pedido);
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
      const tarifa_domicilio = 0;

      // GESTIÓN DEL CLIENTE: Buscar o crear el cliente real
      let clienteFinalId = cliente_id; 
      if (dto.cliente?.nombre && dto.cliente?.telefono) {
        try {
          const clientesExistentes = await queryRunner.manager.query(
            `SELECT id FROM "cliente" WHERE telefono = $1 LIMIT 1`,
            [dto.cliente.telefono]
          );
          
          if (clientesExistentes.length > 0) {
            clienteFinalId = clientesExistentes[0].id;
          } else {
            const newClientId = randomUUID();
            await queryRunner.manager.query(
              `INSERT INTO "cliente" ("id", "nombre", "telefono", "restaurante_id") VALUES ($1, $2, $3, $4)`,
              [newClientId, dto.cliente.nombre, dto.cliente.telefono, restaurante_id]
            );
            clienteFinalId = newClientId;
          }
        } catch (err) {
          console.error('Error insertando cliente:', err);
        }
      }

      // Calcular subtotal y validar items del carrito (Soporte para porciones, adiciones y precios seguros)
      let subtotal = 0;
      const itemsCalculados = [];
      const itemsCarrito = dto.carrito || [];

      for (const item of itemsCarrito) {
        const producto = await this.productoRepository.findOne({
          where: { id: item.producto_id, restaurante_id },
        });

        if (!producto || !producto.disponible) {
          throw new BadRequestException(`Producto no disponible o no encontrado`);
        }

        let precioUnitarioBase = 0;
        let porcionId = null;

        // Si el ítem especifica una porción (ej. carne de 400g)
        if (item.producto_porcion_id) {
          const porcion = await this.porcionRepository.findOne({
            where: { id: item.producto_porcion_id, productoId: producto.id },
          });

          if (!porcion) {
            throw new BadRequestException(`La porción seleccionada no es válida para el producto ${producto.nombre}`);
          }

          precioUnitarioBase = Number(porcion.precio);
          porcionId = porcion.id;
        } else {
          // Si es un producto estándar con precio base
          if (producto.precio === null || producto.precio === undefined) {
            throw new BadRequestException(`El producto ${producto.nombre} requiere que selecciones una porción o tamaño`);
          }
          precioUnitarioBase = Number(producto.precio);
        }

        // 🧀 PROCESAR ADICIONES / TOPPINGS Y CREAR EL SNAPSHOT
        let precioAdicionesUnitario = 0;
        const adicionesSnapshot = [];

        if (item.adiciones_seleccionadas && Array.isArray(item.adiciones_seleccionadas)) {
          for (const adDto of item.adiciones_seleccionadas) {
            const precioAdicion = Number(adDto.precio) || 0;
            precioAdicionesUnitario += precioAdicion;

            adicionesSnapshot.push({
              id: adDto.id || null,
              nombre: adDto.nombre,
              precio: precioAdicion,
            });
          }
        }

        // Precio unitario final por unidad (Base + Adiciones)
        const precioUnitarioFinal = precioUnitarioBase + precioAdicionesUnitario;
        const precioTotalItem = precioUnitarioFinal * item.cantidad;
        subtotal += precioTotalItem;

        itemsCalculados.push({
          producto_id: producto.id,
          producto_porcion_id: porcionId,
          cantidad: item.cantidad,
          precio_unitario: precioUnitarioFinal,
          adiciones_seleccionadas: adicionesSnapshot.length > 0 ? adicionesSnapshot : null,
        });
      }

      const total = subtotal + tarifa_domicilio;
      const numero_pedido = Math.floor(100000 + Math.random() * 900000);

      // Crear y guardar el pedido principal
      const nuevoPedido = queryRunner.manager.create(Pedido, {
        restaurante_id,
        cliente_id: clienteFinalId,
        numero_pedido,
        direccion: dto.entrega?.direccion || 'Dirección no especificada',
        zona_domicilio_id: undefined,
        referencia: dto.entrega?.referencia,
        instrucciones: dto.entrega?.instrucciones,
        metodo_pago: dto.pago?.metodo || TipoPagoQR.EFECTIVO,
        subtotal,
        tarifa_domicilio,
        total,
        estado: EstadoPedido.PENDIENTE,
      });

      nuevoPedido.cliente = { id: clienteFinalId } as any; 
      const pedidoGuardado = await queryRunner.manager.save(nuevoPedido);

      // Guardar detalles del pedido con su porción, precio blindado y el snapshot de adiciones
      for (const itemCalc of itemsCalculados) {
        const nuevoDetalle = queryRunner.manager.create(DetallePedido, {
          pedido_id: pedidoGuardado.id,          
          producto_id: itemCalc.producto_id,    
          producto_porcion_id: itemCalc.producto_porcion_id,
          pedido: { id: pedidoGuardado.id },    
          producto: { id: itemCalc.producto_id }, 
          ...(itemCalc.producto_porcion_id ? { productoPorcion: { id: itemCalc.producto_porcion_id } } : {}),
          cantidad: itemCalc.cantidad,
          precio_unitario_en_momento: itemCalc.precio_unitario,
          adiciones_seleccionadas: itemCalc.adiciones_seleccionadas,
        } as any);
        await queryRunner.manager.save(nuevoDetalle);
      }

      // Si el pago es Nequi / Transferencia QR
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

      // Recargar el pedido para devolver la respuesta limpia
      const pedidoConDetalles = await this.obtenerPorId(pedidoGuardado.id, restaurante_id);

      return {
        exito: true,
        pedido: pedidoConDetalles,
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