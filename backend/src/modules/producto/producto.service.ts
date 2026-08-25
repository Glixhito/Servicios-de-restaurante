import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Producto, EstadoProducto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductoGateway } from './producto.gateway';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly productoGateway: ProductoGateway,
  ) {}

  async crear(
    restaurante_id: string,
    dto: CreateProductoDto,
  ): Promise<Producto> {
    // Validar que no exista un producto con el mismo nombre
    const existe = await this.productoRepository.findOne({
      where: {
        restaurante_id,
        nombre: dto.nombre,
        deleted_at: IsNull(),
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe un producto con este nombre',
      );
    }

    const producto = this.productoRepository.create({
      ...dto,
      restaurante_id,
      disponible: true,
      estado: EstadoProducto.ACTIVO,
    });

    const guardado = await this.productoRepository.save(producto);
    
    // Notificar en tiempo real
    this.productoGateway.notificarCambioMenu();

    return guardado;
  }

  async obtenerPorRestaurante(
    restaurante_id: string,
    soloActivos: boolean = true,
  ): Promise<Producto[]> {
    const query = this.productoRepository.createQueryBuilder('p')
      .where('p.restaurante_id = :restaurante_id', { restaurante_id })
      .andWhere('p.deleted_at IS NULL');

    if (soloActivos) {
      query
        .andWhere('p.disponible = true')
        .andWhere('p.estado = :estado', { estado: EstadoProducto.ACTIVO });
    }

    return await query.orderBy('p.nombre', 'ASC').getMany();
  }

  async obtenerPorCategoria(
    categoria_id: string,
    restaurante_id: string,
  ): Promise<Producto[]> {
    return await this.productoRepository.find({
      where: {
        categoria_id,
        restaurante_id,
        disponible: true,
        estado: EstadoProducto.ACTIVO,
        deleted_at: IsNull(),
      },
      order: { nombre: 'ASC' },
    });
  }

  async obtenerPorId(
    id: string,
    restaurante_id: string,
  ): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id, restaurante_id, deleted_at: IsNull() },
      relations: ['categoria'],
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async actualizar(
    id: string,
    restaurante_id: string,
    dto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.obtenerPorId(id, restaurante_id);
    Object.assign(producto, dto);
    const actualizado = await this.productoRepository.save(producto);

    // Notificar en tiempo real
    this.productoGateway.notificarCambioMenu();

    return actualizado;
  }

  async toggleDisponibilidad(
    id: string,
    restaurante_id: string,
  ): Promise<Producto> {
    const producto = await this.obtenerPorId(id, restaurante_id);
    producto.disponible = !producto.disponible;
    const actualizado = await this.productoRepository.save(producto);

    // Notificar en tiempo real
    this.productoGateway.notificarCambioMenu();

    return actualizado;
  }

  async retirar(id: string, restaurante_id: string): Promise<Producto> {
    const producto = await this.obtenerPorId(id, restaurante_id);
    producto.estado = EstadoProducto.RETIRADO;
    producto.deleted_at = new Date();
    const retirado = await this.productoRepository.save(producto);

    // Notificar en tiempo real
    this.productoGateway.notificarCambioMenu();

    return retirado;
  }

  // RN-002: Verificar disponibilidad de múltiples productos
  async verificarDisponibilidad(productIds: string[]): Promise<string[]> {
    const productos = await this.productoRepository
      .createQueryBuilder('p')
      .whereInIds(productIds)
      .andWhere('p.disponible = false')
      .select(['p.id', 'p.nombre'])
      .getMany();

    return productos.map((p) => p.id);
  }
}