import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto }    from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { userToDto } from '../users/user.mapper';

@Controller('auth')
export class AuthController {
  constructor(private readonly users: UsersService) {}

  /** Registro */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const exists = await this.users.findByUsername(dto.username);
    if (exists) throw new BadRequestException('Usuario ya existe');

    const user = await this.users.create(dto);
    return {
      user:  userToDto(user),
      token: this.users.issueDevToken(user),
    };
  }

  /** Login */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.users.findByUsername(dto.username);
    const valid = user && await this.users.validatePassword(dto.password, user.password_hash);
    if (!valid) throw new BadRequestException('Credenciales incorrectas');

    return {
      user:  userToDto(user),
      token: this.users.issueDevToken(user),
    };
  }
}
