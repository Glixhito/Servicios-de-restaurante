import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonaDomicilio } from './entities/zona-domicilio.entity';
import { ZonaDomicilioService } from './zona-domicilio.service';
import { ZonaDomicilioController } from './zona-domicilio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ZonaDomicilio])],
  providers: [ZonaDomicilioService],
  controllers: [ZonaDomicilioController],
  exports: [ZonaDomicilioService],
})
export class ZonaDomicilioModule {}