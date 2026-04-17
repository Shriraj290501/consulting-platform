import { Module } from '@nestjs/common';
import { ConsultationsController, AdminConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';

@Module({
  controllers: [ConsultationsController, AdminConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
