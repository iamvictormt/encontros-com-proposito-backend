import { Injectable, BadRequestException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    if (!data.email && !data.cpf) {
      throw new BadRequestException('Informe Email ou CPF');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        cpf: data.cpf,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
