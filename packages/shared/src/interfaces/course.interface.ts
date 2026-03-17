import { CourseLevel } from '../enums/course-level.enum';

export interface ICourse {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: CourseLevel;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
