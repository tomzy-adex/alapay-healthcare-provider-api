import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  IsEmail,
  IsString,
  IsUUID,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { OnboardingType } from '../../utils/types';

export class OnboardAccountDto {
  @ApiProperty({
    type: [String],
    description: 'An array of emails to onboard',
    example: ['user1@example.com', 'user2@example.com'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true }) // Validate each email in the array
  emails: string[];

  @ApiProperty({
    type: String,
    description: 'The role ID to assign',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
  })
  @IsString()
  @IsUUID() // Validate the roleId as a UUID
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    enumName: 'OnboardingType',
    description: 'The onboarding type to assign',
    example: OnboardingType,
  })
  @IsEnum(OnboardingType)
  @IsNotEmpty()
  onboardingType: OnboardingType;
}
