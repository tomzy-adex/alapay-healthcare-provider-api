import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthData } from 'src/utils/auth.strategy';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { GetAuthData } from 'src/utils/decorators/auth.decorator';
import { QueryDto } from 'src/config/dto/query.dto';
import {
  AddClaimNoteDto,
  ClaimPaymentQueryDto,
  CreateClaimPaymentDto,
  FilterQueryDto,
  FlagDiscrepancyDto,
} from './dto/claim-payment.dto';

@ApiBearerAuth('JWT')
@ApiTags('Payments')
@UseInterceptors(AuditInterceptor)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AdminGuard)
  @Get('payment-status')
  @AuditLog('Get', 'Payment')
  async submitClaim(
    @Query() query: QueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.paymentService.getClaimsPaymentStatusForHospital(
      authData,
      query,
    );
  }

  @UseGuards(AdminGuard)
  @Get('filter-claims')
  @AuditLog('Get', 'Payment')
  async filterClaims(
    @Query() query: QueryDto & ClaimPaymentQueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.paymentService.filterClaims(authData, query);
  }

  @UseGuards(AdminGuard)
  @Post(':claimId/flag-discrepancy')
  @AuditLog('Post', 'Payment')
  async flagDiscrepancy(
    @Param() claimId: string,
    @Body() payload: FlagDiscrepancyDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.paymentService.flagDiscrepancy(claimId, payload, authData);
  }

  @UseGuards(AdminGuard)
  @Post('create-claim-payment')
  @AuditLog('Post', 'Payment')
  async createClaimPayment(
    @Body() payload: CreateClaimPaymentDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.paymentService.createClaimPayment(payload, authData);
  }

  @UseGuards(AdminGuard)
  @Get('download-reports')
  @AuditLog('Get', 'Payment')
  async downloadPaymentReports(
    @Query() query: QueryDto & ClaimPaymentQueryDto,
    @GetAuthData() authData: AuthData,
    @Res() res: Response,
  ) {
    return this.paymentService.downloadPaymentReports(authData, query, res);
  }

  @UseGuards(AdminGuard)
  @Get('hmo-payment-summary')
  @AuditLog('Get', 'Payment')
  async generateHmoPaymentSummary(
    @Query() query: FilterQueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.paymentService.generateHmoPaymentSummary(authData, query);
  }

  @UseGuards(AdminGuard)
  @Post('add-internal-note')
  @AuditLog('Post', 'Payment')
  async addInternalNote(
    @Body() payload: AddClaimNoteDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.paymentService.addInternalNote(payload, authData);
  }
}
