import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  MinLength,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CrearProductoPorcionDto } from './crear-producto-porcion.dto';

// 🧀 NUEVO DTO: Definimos la estructura que debe tener cada adición recibida
export class CrearProductoAdicionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsNumber()
  @Min(0)
  precio: number;
}

export class CreateProductoDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsUUID()
  categoria_id: string;

  // 1. Ahora el precio base es opcional, porque las carnes no lo usarán
  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsString()
  imagen_url?: string;

  // 2. Agregamos la validación en cascada para el arreglo de porciones
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearProductoPorcionDto)
  porciones?: CrearProductoPorcionDto[];

  // 🧀 3. NUEVO: Agregamos la validación en cascada para el arreglo de adiciones
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearProductoAdicionDto)
  adiciones?: CrearProductoAdicionDto[];
}