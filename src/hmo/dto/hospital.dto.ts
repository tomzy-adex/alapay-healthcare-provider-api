import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsJSON,
  IsBoolean,
  IsEmail,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateHospitalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^\+[1-9][0-9]{7,14}$/, {
    message:
      'Phone number must be in international format, starting with + followed by 8 to 15 digits',
  })
  phone: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // planIds: string[];

  @IsOptional()
  @IsBoolean()
  emergencyServiceProvider?: boolean;
}

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {}

export class PreAuthRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  enrolleeNo: string;

  @ApiProperty()
  @IsJSON()
  @IsNotEmpty()
  treatmentDetails: Record<string, any>;

  @ApiProperty()
  @IsJSON()
  @IsNotEmpty()
  providerInfo: Record<string, any>;
}

export class CreateHospitalInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, {
    message: 'Account number must be exactly 10 digits',
  })
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankCode: string;
}

export class UpdateHospitalInfoDto extends PartialType(CreateHospitalInfoDto) {}
