import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async crearOEncontrar(
    restaurante_id: string,
    nombre: string,
    telefono: string,
  ): Promise<Cliente> {
    // Buscar cliente existente
    let cliente = await this.clienteRepository.findOne({
      where: { restaurante_id, telefono },
    });

    // Si no existe, crear uno nuevo
    if (!cliente) {
      cliente = this.clienteRepository.create({
        restaurante_id,
        nombre,
        telefono,
        primera_vez: true,
      });
      await this.clienteRepository.save(cliente);
    } else {
      // Actualizar si es la primera vez
      if (cliente.primera_vez) {
        cliente.primera_vez = false;
        await this.clienteRepository.save(cliente);
      }
    }

    return cliente;
  }

  async obtenerPorId(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['pedidos'],
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async obtenerPorTelefono(
    restaurante_id: string,
    telefono: string,
  ): Promise<Cliente | null> {
    return await this.clienteRepository.findOne({
      where: { restaurante_id, telefono },
    });
  }
}