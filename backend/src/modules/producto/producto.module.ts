import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { ProductoGateway } from './producto.gateway'; // <-- 1. Importar el Gateway

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  providers: [ProductoService, ProductoGateway], // <-- 2. Agregar ProductoGateway aquí
  controllers: [ProductoController],
  exports: [ProductoService],
})
export class ProductoModule {}