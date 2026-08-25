import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Administrador } from './entities/administrador.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Administrador)
    private readonly adminRepository: Repository<Administrador>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    // Verificar si email ya existe
    const existe = await this.adminRepository.findOne({
      where: { email: dto.email },
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear administrador
    const admin = this.adminRepository.create({
      email: dto.email,
      password_hash: hashedPassword,
      nombre: dto.nombre,
      restaurante_id: dto.restaurante_id,
    });

    await this.adminRepository.save(admin);

    // Generar JWT
    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      restaurante_id: admin.restaurante_id,
    });

    return { access_token: token };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // Buscar admin
    const admin = await this.adminRepository.findOne({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(
      dto.password,
      admin.password_hash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    admin.last_login = new Date();
    await this.adminRepository.save(admin);

    // Generar JWT
    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      restaurante_id: admin.restaurante_id,
    });

    return { access_token: token };
  }
}