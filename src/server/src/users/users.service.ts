import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from "typeorm";
import { User } from './user.entity';
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  issueDevToken(user: Pick<User, 'user_id' | 'username'>): string {
    return Buffer.from(`${user.user_id}:${user.username}`).toString('base64');
  }

  async create(userData: { username: string; password: string; email?: string; name?: string }): Promise<User> {
  if (!userData.email) userData.email = `${userData.username}@example.com`;
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    const user = this.usersRepository.create({
      username: userData.username,
      email: userData.email,
      name: userData.name || userData.username,
      password_hash,
      theme: 'dark'
    });

    return this.usersRepository.save(user)
  }

  /** Devuelve el usuario por nombre de usuario */
  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { user_id: id } })
  }

  /** Comprueba que la contraseña en texto plano coincida con el hash */
  async validatePassword( plainPassword: string, passwordHash: string ): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  async updateTheme(userId: number, theme: string): Promise<User> {
    await this.usersRepository.update(userId, { theme })
    return this.findById(userId)
  }

  async updateProfile(userId: number, updates: { username?: string; name?: string }): Promise<User> {
    await this.usersRepository.update(userId, updates)
    return this.findById(userId)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
