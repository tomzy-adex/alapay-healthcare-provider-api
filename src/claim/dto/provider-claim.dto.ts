import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsJSON,
  IsUUID,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class ProviderClaimDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  enrolleeNo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serviceBreakdown?: Record<string, any>[];

  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  documents?: Record<string, any>[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  diagnosis?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  testResults?: Record<string, any>[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dischargeSummary?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  hmoId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  preAuthRequestId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note: string;
}

export class UpdateProviderClaimDto extends PartialType(ProviderClaimDto) {}

export class SearchProviderClaimDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  patient?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  hmoId?: string;
}

export class FilterProviderClaimDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  hmoId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  enrolleeNo?: string;
}
