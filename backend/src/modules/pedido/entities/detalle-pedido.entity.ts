import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { ProductoPorcion } from '../../producto/entities/producto-porcion.entity';

@Entity('detalle_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() // 🚀 Optimiza la búsqueda de detalles por pedido
  @Column({ type: 'uuid' })
  pedido_id: string;

  @Index() // 🚀 Optimiza estadísticas por producto
  @Column({ type: 'uuid' })
  producto_id: string;

  @Column({ type: 'uuid', nullable: true })
  producto_porcion_id: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario_en_momento: number;

  // 🧀 NUEVO: Guarda la fotografía exacta de las adiciones elegidas y su precio al momento de comprar
  @Column({ type: 'jsonb', nullable: true })
  adiciones_seleccionadas: Array<{
    id?: string;
    nombre: string;
    precio: number;
  }>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, {
    onDelete: 'CASCADE',
  })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.detalles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => ProductoPorcion, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'producto_porcion_id' })
  productoPorcion: ProductoPorcion;

  get subtotal(): number {
    const precioBase = Number(this.precio_unitario_en_momento) || 0;
    
    // Sumamos el precio de las adiciones si existen en el snapshot
    const totalAdiciones = Array.isArray(this.adiciones_seleccionadas)
      ? this.adiciones_seleccionadas.reduce((sum, ad) => sum + (Number(ad.precio) || 0), 0)
      : 0;

    return (precioBase + totalAdiciones) * this.cantidad;
  }
}