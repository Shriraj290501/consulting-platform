import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Logo Analysis' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Professional logo analysis and improvement guidance' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 149.99, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'https://example.com/logo-analysis.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
