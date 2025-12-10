import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        cpf,
        password: hashedPassword.toString(),
      },
    });

    // Retornar token JWT
    const token = this.jwtService.sign({ userId: user.id });

    return { user, token };
  }

  async login(emailOrCpf: string, password: string) {
    // Buscar usuário por email ou cpf
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrCpf }, { cpf: emailOrCpf }],
      },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Comparar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Senha inválida');

    // Retornar token
    const access_token = this.jwtService.sign({ userId: user.id });
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, access_token };
  }
}
