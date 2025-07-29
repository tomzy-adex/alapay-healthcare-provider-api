import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDto {
  @ApiProperty({ default: 1 })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1)) // Default to 1 if undefined
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 12 })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 12)) // Default to 12 if undefined
  @IsNumber()
  @Min(12)
  @Max(50)
  limit: number;
}
