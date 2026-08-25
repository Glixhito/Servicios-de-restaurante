import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  MinLength,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsUUID()
  categoria_id: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsString()
  imagen_url?: string;
}