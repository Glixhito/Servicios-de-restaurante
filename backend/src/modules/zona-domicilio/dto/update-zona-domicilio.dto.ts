import { PartialType } from '@nestjs/mapped-types';
import { CreateZonaDomicilioDto } from './create-zona-domicilio.dto';

export class UpdateZonaDomicilioDto extends PartialType(
  CreateZonaDomicilioDto,
) {}