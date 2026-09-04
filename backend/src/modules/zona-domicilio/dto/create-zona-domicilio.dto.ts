import { IsString, IsNumber, Min, MinLength } from 'class-validator';

export class CreateZonaDomicilioDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsNumber()
  @Min(0)
  tarifa: number;
}