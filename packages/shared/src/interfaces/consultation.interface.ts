import { ConsultationStatus } from '../enums/consultation-status.enum';

export interface IConsultation {
  id: string;
  userId: string;
  serviceId: string;
  status: ConsultationStatus;
  scheduledDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
