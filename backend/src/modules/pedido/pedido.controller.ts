import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { PedidoService } from './pedido.service';

@Controller('api/pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  /**
   * CREAR PEDIDO (Soporta QR Nequi, Bre-B o Efectivo)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearPedido(@Body() dto: any, @Req() req: Request) {
    // 💡 Usamos UUIDs válidos para evitar errores de sintaxis en PostgreSQL
    const restaurante_id = process.env.RESTAURANTE_ID || 'bedce470-9c18-48ee-9ff3-da819cde2f14';
    const cliente_id = dto.cliente_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    return await this.pedidoService.crearPedido(
      restaurante_id,
      cliente_id,
      dto,
      req.ip || '0.0.0.0',
      req.headers['user-agent'] || 'Unknown',
    );
  }

  /**
   * OBTENER PEDIDO POR ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerPorId(@Param('id') id: string) {
    const restaurante_id = process.env.RESTAURANTE_ID || 'bedce470-9c18-48ee-9ff3-da819cde2f14';
    return await this.pedidoService.obtenerPorId(id, restaurante_id);
  }
}