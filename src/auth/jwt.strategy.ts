import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // Validar se o usuário ainda existe
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) return null; // automaticamente retorna 401
    const { password, ...result } = user;
    return result; // isso será injetado em req.user
  }
}
