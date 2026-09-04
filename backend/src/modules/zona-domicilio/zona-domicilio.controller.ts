import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ZonaDomicilioService } from './zona-domicilio.service';
import { CreateZonaDomicilioDto } from './dto/create-zona-domicilio.dto';
import { UpdateZonaDomicilioDto } from './dto/update-zona-domicilio.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/zonas')
export class ZonaDomicilioController {
  constructor(private readonly zonaService: ZonaDomicilioService) {}

  @Get()
  async obtenerZonasActivas() {
    const restaurante_id = process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.zonaService.obtenerActivas(restaurante_id);
  }

  @Post()
  @UseGuards(JwtGuard)
  async crear(
    @Body() dto: CreateZonaDomicilioDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.zonaService.crear(restaurante_id, dto);
  }

  @Get('admin')
  @UseGuards(JwtGuard)
  async obtenerTodas(
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.zonaService.obtenerPorRestaurante(restaurante_id);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async obtenerPorId(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.zonaService.obtenerPorId(id, restaurante_id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateZonaDomicilioDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.zonaService.actualizar(id, restaurante_id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async desactivar(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.zonaService.desactivar(id, restaurante_id);
  }
}