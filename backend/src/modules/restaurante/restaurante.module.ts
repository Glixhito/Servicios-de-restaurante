import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurante } from './entities/restaurante.entity';
import { RestauranteService } from './restaurante.service';
import { RestauranteController } from './restaurante.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante])],
  providers: [RestauranteService],
  controllers: [RestauranteController],
  exports: [RestauranteService],
})
export class RestauranteModule {}