import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonaDomicilio } from './entities/zona-domicilio.entity';
import { CreateZonaDomicilioDto } from './dto/create-zona-domicilio.dto';
import { UpdateZonaDomicilioDto } from './dto/update-zona-domicilio.dto';

@Injectable()
export class ZonaDomicilioService {
  constructor(
    @InjectRepository(ZonaDomicilio)
    private readonly zonaRepository: Repository<ZonaDomicilio>,
  ) {}

  async crear(
    restaurante_id: string,
    dto: CreateZonaDomicilioDto,
  ): Promise<ZonaDomicilio> {
    // Validar nombre único
    const existe = await this.zonaRepository.findOne({
      where: { restaurante_id, nombre: dto.nombre },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe una zona con este nombre',
      );
    }

    const zona = this.zonaRepository.create({
      ...dto,
      restaurante_id,
      activa: true,
    });

    return await this.zonaRepository.save(zona);
  }

  async obtenerPorRestaurante(restaurante_id: string): Promise<ZonaDomicilio[]> {
    return await this.zonaRepository.find({
      where: { restaurante_id },
      order: { nombre: 'ASC' },
    });
  }

  async obtenerActivas(restaurante_id: string): Promise<ZonaDomicilio[]> {
    return await this.zonaRepository.find({
      where: { restaurante_id, activa: true },
      order: { nombre: 'ASC' },
    });
  }

  async obtenerPorId(
    id: string,
    restaurante_id: string,
  ): Promise<ZonaDomicilio> {
    const zona = await this.zonaRepository.findOne({
      where: { id, restaurante_id },
    });

    if (!zona) {
      throw new NotFoundException('Zona de domicilio no encontrada');
    }

    return zona;
  }

  async actualizar(
    id: string,
    restaurante_id: string,
    dto: UpdateZonaDomicilioDto,
  ): Promise<ZonaDomicilio> {
    const zona = await this.obtenerPorId(id, restaurante_id);
    Object.assign(zona, dto);
    return await this.zonaRepository.save(zona);
  }

  async desactivar(id: string, restaurante_id: string): Promise<ZonaDomicilio> {
    const zona = await this.obtenerPorId(id, restaurante_id);
    zona.activa = false;
    return await this.zonaRepository.save(zona);
  }

  // RN-014, RN-031: Validar zona activa
  async validarZonaActiva(
    zona_id: string,
    restaurante_id: string,
  ): Promise<ZonaDomicilio> {
    const zona = await this.zonaRepository.findOne({
      where: { id: zona_id, restaurante_id, activa: true },
    });

    if (!zona) {
      throw new BadRequestException(
        'Zona de domicilio no disponible o inactiva',
      );
    }

    return zona;
  }
}