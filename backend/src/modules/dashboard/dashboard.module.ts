import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from '../pedido/entities/pedido.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
