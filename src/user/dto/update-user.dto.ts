import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProcessStatus } from 'src/utils/types';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class AccountApprovalDto {
  @ApiProperty({ enumName: 'Status', enum: ProcessStatus })
  @IsEnum(ProcessStatus)
  @IsNotEmpty()
  status: ProcessStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
