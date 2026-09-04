import {
  IsArray,
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoPagoQR } from '../../pago/entities/pago-qr.entity';

export class ItemCarritoDto {
  @IsUUID()
  producto_id: string;

  // 👈 NUEVO: Identificador de la porción/gramaje elegido (opcional para productos estándar)
  @IsUUID()
  @IsOptional()
  producto_porcion_id?: string;

  @IsNumber()
  cantidad: number;
}

export class ClienteDataDto {
  @IsString()
  nombre: string;

  @IsString()
  telefono: string;
}

export class EntregaDataDto {
  @IsString()
  direccion: string;

  @IsUUID()
  zona_id: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  instrucciones?: string;
}

export class PagoDataDto {
  @IsEnum(TipoPagoQR)
  metodo: TipoPagoQR;

  @IsOptional()
  @IsString()
  referencia_externa?: string;

  @IsOptional()
  @IsString()
  comprobante_url?: string;
}

export class CreatePedidoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCarritoDto)
  carrito: ItemCarritoDto[];

  @ValidateNested()
  @Type(() => ClienteDataDto)
  cliente: ClienteDataDto;

  @ValidateNested()
  @Type(() => EntregaDataDto)
  entrega: EntregaDataDto;

  @ValidateNested()
  @Type(() => PagoDataDto)
  pago: PagoDataDto;
}