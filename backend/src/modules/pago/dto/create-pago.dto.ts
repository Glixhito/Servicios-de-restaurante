import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipoPagoQR } from '../entities/pago-qr.entity';

export class CreatePagoDto {
  @IsEnum(TipoPagoQR)
  metodo: TipoPagoQR;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsOptional()
  @IsString()
  referencia_externa?: string;

  @IsOptional()
  @IsString()
  comprobante_url?: string;
}
