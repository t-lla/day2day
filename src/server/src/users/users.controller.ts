import {
  Controller, Get, Param, Put, Body, ParseIntPipe, NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { userToDto } from './user.mapper';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async findAll() {
    const all = await this.users.findAll();
    return all.map(userToDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const u = await this.users.findById(id);
    if (!u) throw new NotFoundException();
    return userToDto(u);
  }

  @Put(':id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { username?: string; name?: string },
  ) {
    const updated = await this.users.updateProfile(id, body);
    return userToDto(updated);
  }

  @Put(':id/theme')
  async updateTheme(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { theme: 'light' | 'dark' },
  ) {
    const updated = await this.users.updateTheme(id, body.theme);
    return userToDto(updated);
  }
}
