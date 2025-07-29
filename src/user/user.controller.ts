import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateHmoadminDto } from './dto/create-user.dto';

import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditLog } from '../utils/decorators/audit-log.decorator';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardAccountDto } from './dto/onboard-user.dto';
import { OnboardingType } from 'src/utils/types';
import { CreateHospitalDto } from 'src/hmo/dto/hospital.dto';

@ApiBearerAuth('JWT')
@ApiTags('User')
@UseInterceptors(AuditInterceptor)
@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get('user')
  @AuditLog('Get', 'User')
  async getAdminById(@Query('adminId') id: string) {
    return await this.userService.getAdminById(id);
  }

  @UseGuards(AdminGuard)
  @Put('update-profile')
  @AuditLog('Put', 'User')
  async updateAdminProfile(
    @Query('userId') userId: string,
    payload: UpdateUserDto,
  ) {
    return await this.userService.updateAdminProfile(userId, payload);
  }

  @Post(':roleId/onboard-provider-admin-account')
  @AuditLog('Post', 'User')
  async registerHmoAdmin(
    @Param('roleId') roleId: string,
    @Query('token') token: string,
    @Body() payload: CreateHmoadminDto,
  ) {
    return await this.userService.registerHealthcareProviderAdmin(
      roleId,
      token,
      payload,
      OnboardingType.HEALTHCARE_PROVIDER_ADMIN,
    );
  }

  @Post(':roleId/onboard-claim-officer-account')
  @AuditLog('Post', 'User')
  async registerClaimOfficer(
    @Param('roleId') roleId: string,
    @Query('token') token: string,
    @Body() payload: CreateHmoadminDto,
  ) {
    return await this.userService.registerHealthcareProviderAdmin(
      roleId,
      token,
      payload,
      OnboardingType.HEALTHCARE_CLAIM_OFFICER,
    );
  }

  @Post(':roleId/onboard-finance-officer-account')
  @AuditLog('Post', 'User')
  async registerFinanceOfficer(
    @Param('roleId') roleId: string,
    @Query('token') token: string,
    @Body() payload: CreateHmoadminDto,
  ) {
    return await this.userService.registerHealthcareProviderAdmin(
      roleId,
      token,
      payload,
      OnboardingType.HEALTHCARE_FINANCE_OFFICER,
    );
  }

  @Post(':roleId/onboard-healthcare-provider-account')
  @AuditLog('Post', 'User')
  async registerHealthcareProvider(
    @Param('roleId') roleId: string,
    @Query('token') token: string,
    @Body() payload: CreateHospitalDto,
  ) {
    return await this.userService.registerHealthcareProvider(
      roleId,
      token,
      payload,
    );
  }

  @UseGuards(AdminGuard)
  @Post('send-onboarding-link')
  @AuditLog('Post', 'User')
  async onboardAccount(@Body() payload: OnboardAccountDto) {
    return await this.userService.onboardAccount(payload);
  }

  @Put('verify-account')
  @AuditLog('Put', 'User')
  async verifyUser(@Query('code') code: string) {
    return await this.userService.verifyUser(code);
  }
}
