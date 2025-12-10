import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SUA_CHAVE_SECRETA',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
