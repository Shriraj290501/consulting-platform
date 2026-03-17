import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationStatusDto } from './dto/update-consultation-status.dto';
import type { ConsultationStatus } from '@consulting/shared';

interface IConsultationResponse {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  scheduledDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service: { title: string };
}

interface IConsultationAdminResponse extends IConsultationResponse {
  user: { email: string };
}

const BASE_SELECT = {
  id: true,
  userId: true,
  serviceId: true,
  status: true,
  scheduledDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

const USER_SELECT = {
  ...BASE_SELECT,
  service: { select: { title: true } },
} as const;

const ADMIN_SELECT = {
  ...BASE_SELECT,
  service: { select: { title: true } },
  user: { select: { email: true } },
} as const;

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateConsultationDto,
  ): Promise<IConsultationResponse> {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      select: { id: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const consultation = await this.prisma.consultation.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        scheduledDate: new Date(dto.scheduledDate),
        notes: dto.notes,
      },
      select: USER_SELECT,
    });

    this.logger.log(`Consultation created by user ${userId} for service ${dto.serviceId}`);
    return this.toResponse(consultation);
  }

  async findMyConsultations(userId: string): Promise<IConsultationResponse[]> {
    const consultations = await this.prisma.consultation.findMany({
      where: { userId },
      select: USER_SELECT,
      orderBy: { scheduledDate: 'desc' },
    });

    return consultations.map((c) => this.toResponse(c));
  }

  async findAll(
    page: number,
    limit: number,
    status?: ConsultationStatus,
  ): Promise<{
    consultations: IConsultationAdminResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: Prisma.ConsultationWhereInput = status ? { status } : {};

    const [consultations, total] = await this.prisma.$transaction([
      this.prisma.consultation.findMany({
        where,
        select: ADMIN_SELECT,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return {
      consultations: consultations.map((c) => this.toAdminResponse(c)),
      total,
      page,
      limit,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateConsultationStatusDto,
  ): Promise<IConsultationAdminResponse> {
    const existing = await this.prisma.consultation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Consultation not found');
    }

    const consultation = await this.prisma.consultation.update({
      where: { id },
      data: { status: dto.status },
      select: ADMIN_SELECT,
    });

    this.logger.log(`Consultation ${id} status updated to ${dto.status}`);
    return this.toAdminResponse(consultation);
  }

  private toResponse(consultation: {
    id: string;
    userId: string;
    serviceId: string;
    status: string;
    scheduledDate: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    service: { title: string };
  }): IConsultationResponse {
    return {
      id: consultation.id,
      userId: consultation.userId,
      serviceId: consultation.serviceId,
      status: consultation.status,
      scheduledDate: consultation.scheduledDate.toISOString(),
      notes: consultation.notes,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString(),
      service: { title: consultation.service.title },
    };
  }

  private toAdminResponse(consultation: {
    id: string;
    userId: string;
    serviceId: string;
    status: string;
    scheduledDate: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    service: { title: string };
    user: { email: string };
  }): IConsultationAdminResponse {
    return {
      ...this.toResponse(consultation),
      user: { email: consultation.user.email },
    };
  }
}
