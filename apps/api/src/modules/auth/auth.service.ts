import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { IUser } from '@consulting/shared';

interface ITokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface IAuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshExpiry: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRY',
      '7d',
    );
  }

  async register(dto: RegisterDto): Promise<IAuthResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
      select: USER_SELECT,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    this.logger.log(`User registered: ${user.email}`);

    return {
      user: this.toUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto): Promise<IAuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { ...USER_SELECT, passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.toUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: oldToken },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        user: { select: USER_SELECT },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Rotate: delete old token and create new one in a transaction
    const [, newTokenRecord] = await this.prisma.$transaction([
      this.prisma.refreshToken.delete({ where: { id: stored.id } }),
      this.prisma.refreshToken.create({
        data: {
          token: randomUUID(),
          userId: stored.userId,
          expiresAt: this.computeRefreshExpiry(),
        },
      }),
    ]);

    const accessToken = this.generateAccessToken(stored.user);

    this.logger.log(`Token refreshed for user: ${stored.user.email}`);

    return { accessToken, refreshToken: newTokenRecord.token };
  }

  async logout(token: string): Promise<void> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: { id: true, user: { select: { email: true } } },
    });

    if (stored) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      this.logger.log(`User logged out: ${stored.user.email}`);
    }
  }

  private generateAccessToken(
    user: Pick<{ id: string; email: string; role: string }, 'id' | 'email' | 'role'>,
  ): string {
    const payload: ITokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: this.computeRefreshExpiry(),
      },
    });
    return token;
  }

  private computeRefreshExpiry(): Date {
    const ms = this.parseDuration(this.refreshExpiry);
    return new Date(Date.now() + ms);
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // default 7 days
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }

  private toUserResponse(
    user: { id: string; email: string; role: string; createdAt: Date; updatedAt: Date },
  ): IUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role as IUser['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
