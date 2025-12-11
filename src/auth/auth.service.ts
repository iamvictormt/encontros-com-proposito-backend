import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { password, email, cpf, fullName } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          fullName,
          email,
          cpf,
          password: hashedPassword,
        },
      });

      const token = this.jwtService.sign({ userId: user.id });

      return { user, token };
    } catch (error) {
      if (error.code === 'P2002') {
        const msg = error.message.toLowerCase();

        if (msg.includes('email')) {
          throw new BadRequestException('Este email já está cadastrado.');
        }

        if (msg.includes('cpf')) {
          throw new BadRequestException('Este CPF já está cadastrado.');
        }

        throw new BadRequestException('Já existe um registro com estes dados.');
      }

      throw error;
    }
  }

    async login(emailOrCpf: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrCpf }, { cpf: emailOrCpf }],
      },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Senha inválida');

    const access_token = this.jwtService.sign({ userId: user.id });
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, access_token };
  }
}
