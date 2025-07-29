import { ClaimPaymentStatus } from 'src/utils/types';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimPaymentQueryDto {
  @ApiProperty({ enum: ClaimPaymentStatus })
  @IsOptional()
  @IsEnum(ClaimPaymentStatus)
  status?: ClaimPaymentStatus;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  hmoName?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class FlagDiscrepancyDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  alapayAdminId: string;
}

export class CreateClaimPaymentDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  claimId: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: Date;
}

export class FilterQueryDto {
  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

export class AddClaimNoteDto {
  @ApiProperty({ type: String })
  @IsUUID()
  @IsNotEmpty()
  claimId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  note: string;
}
