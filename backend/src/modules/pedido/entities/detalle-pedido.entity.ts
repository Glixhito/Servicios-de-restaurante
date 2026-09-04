import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { ProductoPorcion } from '../../producto/entities/producto-porcion.entity'; // 👈 1. Importar la porción

@Entity('detalle_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pedido_id: string;

  @Column({ type: 'uuid' })
  producto_id: string;

  // 👈 2. Nuevo campo opcional para identificar la porción/gramaje elegido (ej. el de 400gr)
  @Column({ type: 'uuid', nullable: true })
  producto_porcion_id: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario_en_momento: number;

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

  // 👈 3. Relación con la porción específica
  @ManyToOne(() => ProductoPorcion, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'producto_porcion_id' })
  productoPorcion: ProductoPorcion;

  get subtotal(): number {
    return this.cantidad * this.precio_unitario_en_momento;
  }
}