import {
  IsArray,
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoPagoQR } from '../../pago/entities/pago-qr.entity';

// 🧀 NUEVO DTO: Valida cada adición/topping que viaja en el ítem del carrito
export class AdicionSeleccionadaDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  nombre: string;

  @IsNumber()
  @Min(0)
  precio: number;
}

export class ItemCarritoDto {
  @IsUUID()
  producto_id: string;

  @IsUUID()
  @IsOptional()
  producto_porcion_id?: string;

  @IsNumber()
  cantidad: number;

  // 🧀 NUEVO CAMPO: Recibe el arreglo de adiciones seleccionadas para este plato
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdicionSeleccionadaDto)
  adiciones_seleccionadas?: AdicionSeleccionadaDto[];
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