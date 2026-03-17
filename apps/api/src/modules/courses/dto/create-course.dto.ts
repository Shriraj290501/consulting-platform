import { IsString, IsNumber, IsOptional, IsUrl, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '@consulting/shared';

export class CreateCourseDto {
  @ApiProperty({ example: 'Stock Market Basics' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Comprehensive introduction to stock market fundamentals' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 199.99, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: '8 weeks' })
  @IsString()
  duration!: string;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level!: CourseLevel;

  @ApiPropertyOptional({ example: 'https://example.com/course.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
