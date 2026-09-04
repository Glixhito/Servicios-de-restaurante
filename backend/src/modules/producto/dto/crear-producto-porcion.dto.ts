import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CrearProductoPorcionDto {
  @IsOptional()
  @IsUUID() // O @IsString() según prefieras
  id?: string; // 👈 Clave para que NestJS no lo elimine y llegue al servicio

  @IsNumber()
  @Min(0)
  gramos: number;

  @IsNumber()
  @Min(0)
  precio: number;
}