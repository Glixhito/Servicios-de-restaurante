import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('adicion')
export class ProductoAdicion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column('numeric', { precision: 10, scale: 2 })
  precio: number;

  @ManyToOne(() => Producto, (producto) => producto.adiciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}