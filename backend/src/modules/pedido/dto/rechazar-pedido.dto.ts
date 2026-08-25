import { IsString } from 'class-validator';

export class RechazarPedidoDto {
  @IsString()
  razon: string;
}