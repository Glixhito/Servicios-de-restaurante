import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  orden?: number;
}