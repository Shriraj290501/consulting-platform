import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsultationDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  serviceId!: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  @IsDateString()
  scheduledDate!: string;

  @ApiPropertyOptional({ example: 'I would like feedback on my corporate logo redesign' })
  @IsOptional()
  @IsString()
  notes?: string;
}
