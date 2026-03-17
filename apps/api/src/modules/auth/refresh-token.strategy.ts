import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import type { IRequestUser } from './jwt.strategy';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validate(req: Request): Promise<IRequestUser> {
    const token = req.cookies?.['refresh_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    return {
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role as IRequestUser['role'],
    };
  }
}
