import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Categoria, EstadoCategoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async crear(
    restaurante_id: string,
    dto: CreateCategoriaDto,
  ): Promise<Categoria> {
    const existe = await this.categoriaRepository.findOne({
      where: {
        restaurante_id,
        nombre: dto.nombre,
        deleted_at: IsNull(),
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe una categoría con este nombre',
      );
    }

    const categoria = this.categoriaRepository.create({
      ...dto,
      restaurante_id,
    });

    return await this.categoriaRepository.save(categoria);
  }

  async obtenerPorRestaurante(restaurante_id: string): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      where: {
        restaurante_id,
        estado: EstadoCategoria.ACTIVA,
        deleted_at: IsNull(),
      },
      order: { orden: 'ASC' },
    });
  }

  async obtenerTodas(restaurante_id: string): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      where: {
        restaurante_id,
        deleted_at: IsNull(),
      },
      order: { orden: 'ASC' },
    });
  }

  async obtenerPorId(
    id: string,
    restaurante_id: string,
  ): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id, restaurante_id, deleted_at: IsNull() },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return categoria;
  }

  async actualizar(
    id: string,
    restaurante_id: string,
    dto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.obtenerPorId(id, restaurante_id);
    Object.assign(categoria, dto);
    return await this.categoriaRepository.save(categoria);
  }

  async desactivar(id: string, restaurante_id: string): Promise<Categoria> {
    const categoria = await this.obtenerPorId(id, restaurante_id);
    categoria.estado = EstadoCategoria.INACTIVA;
    return await this.categoriaRepository.save(categoria);
  }

  async retirar(id: string, restaurante_id: string): Promise<Categoria> {
    const categoria = await this.obtenerPorId(id, restaurante_id);
    categoria.estado = EstadoCategoria.RETIRADA;
    categoria.deleted_at = new Date();
    return await this.categoriaRepository.save(categoria);
  }
}