import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);

      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        fullName: true,
      },
    });

    if (!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid');

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.userRepository.update(id, updateUserDto);

      const updatedUser = await this.userRepository.findOne({
        where: { id },
      });

      return updatedUser;
    } catch (error) {
      // 23505 es violación de restricción UNIQUE en Neon
      if (error.code === '23505') {
        throw new BadRequestException('El nickname ingresado ya está en uso');
      }

      console.log(error);
      throw new InternalServerErrorException(
        'Error inesperado al actualizar el perfil',
      );
    }
  }

  checkAuthStatus(user: User) {
    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: { id: string }) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    const dbError = error as { code?: string; errno?: number; detail?: string };

    if (dbError.code === '23505' || dbError.errno === 1062)
      throw new BadRequestException('User already exists');

    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
