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
    // 🇨🇴 Obtenemos la fecha actual exacta en la zona horaria de Colombia con tipado correcto
    const opcionesFecha: Intl.DateTimeFormatOptions = { 
      timeZone: 'America/Bogota', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    
    const formatter = new Intl.DateTimeFormat('en-CA', opcionesFecha); // Formato YYYY-MM-DD
    const fechaColombiaStr = formatter.format(new Date()); // Ej: "2026-08-31"

    // Creamos el objeto Date interpretando esa fecha local como el inicio del día en Colombia (00:00:00)
    const hoy = new Date(`${fechaColombiaStr}T00:00:00-05:00`);

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