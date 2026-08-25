import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../producto/entities/producto.entity';

@Entity('detalle_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pedido_id: string;

  @Column({ type: 'uuid' })
  producto_id: string;

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
  producto: Producto;

  get subtotal(): number {
    return this.cantidad * this.precio_unitario_en_momento;
  }
}