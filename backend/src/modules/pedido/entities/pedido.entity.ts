import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { ZonaDomicilio } from '../../zona-domicilio/entities/zona-domicilio.entity';
// 💡 FIX 1: Importamos correctamente nuestras nuevas clases
import { PagoQR, TipoPagoQR } from '../../pago/entities/pago-qr.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { HistorialEstadoPedido } from './historial-estado-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO',
  EN_CAMINO = 'EN_CAMINO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'uuid' })
  cliente_id: string;

  @Column({ type: 'bigint', unique: true })
  numero_pedido: number;

  @Column({ type: 'enum', enum: EstadoPedido, default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column({ type: 'varchar', length: 500 })
  direccion: string;

  @Column({ type: 'uuid' })
  zona_domicilio_id: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referencia: string;

  @Column({ type: 'text', nullable: true })
  instrucciones: string;

  // 💡 FIX 2: Usamos TipoPagoQR en lugar del viejo MetodoPago
  @Column({ type: 'enum', enum: TipoPagoQR, default: TipoPagoQR.EFECTIVO })
  metodo_pago: TipoPagoQR;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tarifa_domicilio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'boolean', default: false })
  pago_efectivo_recibido: boolean;

  // 💡 FIX 3: Agregamos pago_verificado (Vital para nuestro Webhook)
  @Column({ type: 'boolean', default: false })
  pago_verificado: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razon_rechazo: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.pedidos, {
    onDelete: 'CASCADE',
  })
  restaurante: Restaurante;

  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos, {
    onDelete: 'RESTRICT',
  })
  cliente: Cliente;

  @ManyToOne(() => ZonaDomicilio, (zona) => zona.pedidos)
  zona: ZonaDomicilio;

  // 💡 FIX 4: Cambiamos 'pago' por 'pago_qr' para conectar perfecto el puente
  @OneToOne(() => PagoQR, (pagoQR) => pagoQR.pedido, { nullable: true })
  pago_qr: PagoQR;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: DetallePedido[];

  @OneToMany(() => HistorialEstadoPedido, (historial) => historial.pedido, {
    cascade: true,
  })
  historial: HistorialEstadoPedido[];
}