import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurante } from './entities/restaurante.entity';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';

@Injectable()
export class RestauranteService {
  constructor(
    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,
  ) {}

  async crear(dto: CreateRestauranteDto): Promise<Restaurante> {
    const restaurante = this.restauranteRepository.create(dto);
    return await this.restauranteRepository.save(restaurante);
  }

  async obtenerTodos(): Promise<Restaurante[]> {
    return await this.restauranteRepository.find({
      relations: ['categorias', 'productos', 'zonas'],
    });
  }

  async obtenerPorId(id: string): Promise<Restaurante> {
    const restaurante = await this.restauranteRepository.findOne({
      where: { id },
      relations: ['categorias', 'productos', 'zonas'],
    });

    if (!restaurante) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurante;
  }

  async obtenerPrimero(): Promise<Restaurante> {
    const restaurante = await this.restauranteRepository.findOne({
      where: {},
      relations: ['categorias', 'productos', 'zonas'],
    });

    if (!restaurante) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurante;
  }

  async actualizar(
    id: string,
    dto: UpdateRestauranteDto,
  ): Promise<Restaurante> {
    const restaurante = await this.obtenerPorId(id);
    Object.assign(restaurante, dto);
    return await this.restauranteRepository.save(restaurante);
  }

  async pausarRecepcion(id: string): Promise<Restaurante> {
    const restaurante = await this.obtenerPorId(id);
    restaurante.aceptando_pedidos = !restaurante.aceptando_pedidos;
    return await this.restauranteRepository.save(restaurante);
  }
}