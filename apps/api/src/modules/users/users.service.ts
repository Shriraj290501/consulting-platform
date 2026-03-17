import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { IUser } from '@consulting/shared';

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string): Promise<IUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    this.logger.log(`Admin listed users: page=${page}, limit=${limit}, total=${total}`);

    return {
      users: users.map((u) => this.toUserResponse(u)),
      total,
      page,
      limit,
    };
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): IUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role as IUser['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
