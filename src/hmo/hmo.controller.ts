import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { HmoService } from './hmo.service';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';
import { AuthData } from 'src/utils/auth.strategy';
import { GetAuthData } from 'src/utils/decorators/auth.decorator';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import {
  CreateHospitalInfoDto,
  PreAuthRequestDto,
  UpdateHospitalDto,
  UpdateHospitalInfoDto,
} from './dto/hospital.dto';
import { SearchProviderClaimDto } from 'src/claim/dto/provider-claim.dto';
import { DownloadFormat } from 'src/utils/types';

@ApiBearerAuth('JWT')
@ApiTags('Provider')
@UseInterceptors(AuditInterceptor)
@Controller('provider')
export class HmoController {
  constructor(private readonly hmoService: HmoService) {}

  @UseGuards(AdminGuard)
  @Get('hmo/check-enrollee-eligibility')
  @AuditLog('Get', 'Hmo')
  async submitClaim(@Query() enrolleeNo: string) {
    return this.hmoService.checkEnrolleeEligibility(enrolleeNo);
  }

  @UseGuards(AdminGuard)
  @Post('hmo/pre-authorization')
  @AuditLog('Post', 'Hmo')
  async requestPreAuthorization(@Body() payload: PreAuthRequestDto) {
    return this.hmoService.requestPreAuthorization(payload);
  }

  @UseGuards(AdminGuard)
  @Get('hmo/treatment-history')
  @AuditLog('Get', 'Hmo')
  async getEnrolleeTreatmentHistory(
    @Query() enrolleeNo: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.hmoService.getEnrolleeTreatmentHistory(
      enrolleeNo,
      authData.hospitalId,
    );
  }

  @UseGuards(AdminGuard)
  @Post('hospital/hospital-info')
  @AuditLog('Post', 'Hmo')
  async createHospitalInfo(
    @Body() payload: CreateHospitalInfoDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.hmoService.createHospitalInfo(
      authData.hospitalId,
      payload,
      authData.id,
    );
  }

  @UseGuards(AdminGuard)
  @Put('hospital/hospital-info')
  @AuditLog('Put', 'Hmo')
  async updateHospitalInfo(
    @Body() payload: UpdateHospitalInfoDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.hmoService.updateHospitalInfo(
      authData.hospitalId,
      payload,
      authData.id,
    );
  }

  @UseGuards(AdminGuard)
  @Put('hospital/update-provider-profile')
  @AuditLog('Put', 'Hmo')
  async updateProviderProfile(
    @Body() payload: UpdateHospitalDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.hmoService.updateProviderProfile(
      authData.hospitalId,
      payload,
      authData.id,
    );
  }

  @UseGuards(AdminGuard)
  @Get('hospital/generate-reports')
  @AuditLog('Get', 'Hmo')
  async generateReports(
    @Query() filters: SearchProviderClaimDto,
    @Query() format: DownloadFormat,
  ) {
    return this.hmoService.generateReports(filters, format);
  }

  @UseGuards(AdminGuard)
  @Get('hospital/organization-info')
  @AuditLog('Get', 'Hmo')
  async viewOrganizationInfo(@GetAuthData() authData: AuthData) {
    return this.hmoService.viewOrganizationInfo(authData.hospitalId);
  }
}
