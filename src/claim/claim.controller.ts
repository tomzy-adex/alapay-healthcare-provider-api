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
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { ClaimService } from './claim.service';
import { GetAuthData } from 'src/utils/decorators/auth.decorator';
import {
  FilterProviderClaimDto,
  ProviderClaimDto,
  UpdateProviderClaimDto,
} from './dto/provider-claim.dto';
import { AuthData } from 'src/utils/auth.strategy';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';
import { AdminGuard } from 'src/utils/guards/admin.guard';

@ApiBearerAuth('JWT')
@ApiTags('Claims')
@UseInterceptors(AuditInterceptor)
@Controller('claim')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @UseGuards(AdminGuard)
  @Post('submit')
  @AuditLog('Post', 'Claim')
  async submitClaim(
    @Body() payload: ProviderClaimDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimService.submitClaim(payload, authData);
  }

  @UseGuards(AdminGuard)
  @Put(':claimId/respond-to-claim')
  @AuditLog('Put', 'Claim')
  async respondToClaimQuery(
    @Param('claimId') claimId: string,
    @Body() payload: UpdateProviderClaimDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimService.respondToClaimQuery(claimId, payload, authData);
  }

  @UseGuards(AdminGuard)
  @Get(':hmoId/track-payments')
  @AuditLog('Get', 'Claim')
  async trackClaimPayments(
    @Param('hmoId') hmoId: string,
    @Query() date: string,
    @GetAuthData() authData: AuthData,
  ) {
    const trackPaymentData = {
      hmoId,
      date,
    };
    return this.claimService.trackClaimPayments(
      authData.hospitalId,
      trackPaymentData,
    );
  }

  @UseGuards(AdminGuard)
  @Get(':claimId/download-remittance-advice')
  @AuditLog('Get', 'Claim')
  async downloadRemittanceAdvice(@Param('claimId') claimId: string) {
    return this.claimService.downloadRemittanceAdvice(claimId);
  }

  @UseGuards(AdminGuard)
  @Get('view-submitted-claims')
  @AuditLog('Get', 'Claim')
  async viewSubmittedClaims(
    @Query() filter: FilterProviderClaimDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimService.viewSubmittedClaims(authData.hospitalId, filter);
  }

  @UseGuards(AdminGuard)
  @Get('export-claims-history')
  @AuditLog('Get', 'Claim')
  async exportClaimsHistory(
    @GetAuthData() authData: AuthData,
    @Query() filter: FilterProviderClaimDto,
  ) {
    return this.claimService.exportClaimsHistory(authData.hospitalId, filter);
  }

  @UseGuards(AdminGuard)
  @Get(':claimId/details')
  @AuditLog('Get', 'Claim')
  async viewClaimDetails(
    @Param('claimId') claimId: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimService.viewClaimDetails(claimId, authData.hospitalId);
  }

  @UseGuards(AdminGuard)
  @Get('claims-history')
  @AuditLog('Get', 'Claim')
  async getClaimsHistory(
    @GetAuthData() authData: AuthData,
    @Query() filter: FilterProviderClaimDto,
  ) {
    return this.claimService.getClaimsHistory(authData.hospitalId, filter);
  }

  @UseGuards(AdminGuard)
  @Post(':claimId/link-authorization')
  @AuditLog('Post', 'Claim')
  async linkClaimToAuthorization(
    @Param('claimId') claimId: string,
    @Body('authorizationCode') authorizationCode: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimService.linkClaimToAuthorization(
      claimId,
      authorizationCode,
      authData,
    );
  }
}
