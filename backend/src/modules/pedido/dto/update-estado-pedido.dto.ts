import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';

export class UpdateEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;

  @IsOptional()
  @IsString()
  razon_cambio?: string;
}