import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getTypeOrmConfig } from './config/typeorm.config';
import { RestauranteModule } from './modules/restaurante/restaurante.module';
import { CategoriaModule } from './modules/categoria/categoria.module';
import { ProductoModule } from './modules/producto/producto.module';
import { ZonaDomicilioModule } from './modules/zona-domicilio/zona-domicilio.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { PagoModule } from './modules/pago/pago.module';
import { PedidoModule } from './modules/pedido/pedido.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),
    ScheduleModule.forRoot(),
    RestauranteModule,
    CategoriaModule,
    ProductoModule,
    ZonaDomicilioModule,
    ClienteModule,
    PagoModule,
    AuthModule,
    PedidoModule,
    DashboardModule,
  ],
})
export class AppModule {}