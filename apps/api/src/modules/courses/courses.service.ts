import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import type { ICourse } from '@consulting/shared';
import type { CourseLevel } from '@consulting/shared';

const CACHE_KEY = 'courses:all';
const CACHE_TTL = 300;

const COURSE_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  duration: true,
  level: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<ICourse[]> {
    const cached = await this.cacheService.get<ICourse[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    const courses = await this.prisma.course.findMany({
      select: COURSE_SELECT,
      orderBy: { createdAt: 'asc' },
    });

    const result = courses.map((c) => this.toResponse(c));
    await this.cacheService.set(CACHE_KEY, result, CACHE_TTL);
    return result;
  }

  async findOne(id: string): Promise<ICourse> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: COURSE_SELECT,
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.toResponse(course);
  }

  async create(dto: CreateCourseDto): Promise<ICourse> {
    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        duration: dto.duration,
        level: dto.level,
        imageUrl: dto.imageUrl,
      },
      select: COURSE_SELECT,
    });

    await this.cacheService.del(CACHE_KEY);
    this.logger.log(`Course created: ${course.title}`);
    return this.toResponse(course);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<ICourse> {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
      select: COURSE_SELECT,
    });

    await this.cacheService.del(CACHE_KEY);
    this.logger.log(`Course updated: ${course.title}`);
    return this.toResponse(course);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    await this.prisma.course.delete({ where: { id } });
    await this.cacheService.del(CACHE_KEY);
    this.logger.log(`Course deleted: ${existing.title}`);
  }

  private toResponse(course: {
    id: string;
    title: string;
    description: string;
    price: Decimal;
    duration: string;
    level: CourseLevel;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ICourse {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price.toNumber(),
      duration: course.duration,
      level: course.level,
      imageUrl: course.imageUrl,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }
}
