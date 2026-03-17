import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import type { IService } from '@consulting/shared';

const CACHE_KEY = 'services:all';
const CACHE_TTL = 600;

const SERVICE_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<IService[]> {
    const cached = await this.cacheService.get<IService[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    const services = await this.prisma.service.findMany({
      select: SERVICE_SELECT,
      orderBy: { createdAt: 'asc' },
    });

    const result = services.map((s) => this.toResponse(s));
    await this.cacheService.set(CACHE_KEY, result, CACHE_TTL);
    return result;
  }

  async findOne(id: string): Promise<IService> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: SERVICE_SELECT,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.toResponse(service);
  }

  async create(dto: CreateServiceDto): Promise<IService> {
    const service = await this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
      },
      select: SERVICE_SELECT,
    });

    await this.cacheService.del(CACHE_KEY);
    this.logger.log(`Service created: ${service.title}`);
    return this.toResponse(service);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<IService> {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
      select: SERVICE_SELECT,
    });

    await this.cacheService.del(CACHE_KEY);
    this.logger.log(`Service updated: ${service.title}`);
    return this.toResponse(service);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.service.delete({ where: { id } });
    await this.cacheService.del(CACHE_KEY);
    this.logger.log(`Service deleted: ${existing.title}`);
  }

  private toResponse(service: {
    id: string;
    title: string;
    description: string;
    price: Decimal;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): IService {
    return {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price.toNumber(),
      imageUrl: service.imageUrl,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }
}
