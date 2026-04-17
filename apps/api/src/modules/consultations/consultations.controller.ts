import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@consulting/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationStatusDto } from './dto/update-consultation-status.dto';
import { ConsultationQueryDto } from './dto/consultation-query.dto';

@ApiTags('Consultations')
@ApiBearerAuth()
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Book a consultation' })
  @ApiResponse({ status: 201, description: 'Consultation booked' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateConsultationDto,
  ) {
    return this.consultationsService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user consultations' })
  @ApiResponse({ status: 200, description: 'List of user consultations' })
  async findMy(@CurrentUser('id') userId: string) {
    return this.consultationsService.findMyConsultations(userId);
  }
}

@ApiTags('Admin — Consultations')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/consultations')
export class AdminConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all consultations (admin, paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of consultations' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: ConsultationQueryDto) {
    return this.consultationsService.findAll(query.page, query.limit, query.status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update consultation status (admin)' })
  @ApiResponse({ status: 200, description: 'Consultation status updated' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationStatusDto,
  ) {
    return this.consultationsService.updateStatus(id, dto);
  }
}
