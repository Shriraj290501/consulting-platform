import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConsultationStatus } from '@consulting/shared';

export class UpdateConsultationStatusDto {
  @ApiProperty({ enum: ConsultationStatus, example: ConsultationStatus.CONFIRMED })
  @IsEnum(ConsultationStatus)
  status!: ConsultationStatus;
}
