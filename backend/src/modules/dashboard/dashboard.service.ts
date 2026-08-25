import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, EstadoPedido } from '../pedido/entities/pedido.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async obtenerResumen(restaurante_id: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const porEstado = await this.pedidoRepository
      .createQueryBuilder('p')
      .select('p.estado', 'estado')
      .addSelect('COUNT(p.id)', 'cantidad')
      .where('p.restaurante_id = :restaurante_id', { restaurante_id })
      .andWhere('p.created_at >= :hoy', { hoy })
      .groupBy('p.estado')
      .getRawMany();

    const ventasHoy = await this.pedidoRepository
      .createQueryBuilder('p')
      .select('SUM(p.total)', 'total')
      .addSelect('COUNT(p.id)', 'cantidad')
      .where('p.restaurante_id = :restaurante_id', { restaurante_id })
      .andWhere('p.created_at >= :hoy', { hoy })
      .andWhere('p.estado != :rechazado', { rechazado: EstadoPedido.RECHAZADO })
      .getRawOne();

    const ultimosPedidos = await this.pedidoRepository.find({
      where: { restaurante_id },
      relations: ['cliente', 'detalles', 'zona'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    return {
      resumen: {
        pendientes: porEstado.find((e) => e.estado === EstadoPedido.PENDIENTE)
          ?.cantidad || 0,
        en_preparacion: porEstado.find(
          (e) => e.estado === EstadoPedido.PREPARANDO,
        )?.cantidad || 0,
        listos: porEstado.find((e) => e.estado === EstadoPedido.LISTO)
          ?.cantidad || 0,
        en_camino: porEstado.find((e) => e.estado === EstadoPedido.EN_CAMINO)
          ?.cantidad || 0,
      },
      ventas_hoy: {
        total: ventasHoy?.total || 0,
        cantidad_pedidos: ventasHoy?.cantidad || 0,
      },
      ultimos_pedidos: ultimosPedidos,
    };
  }
}
