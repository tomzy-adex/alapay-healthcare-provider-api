import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClaimPaymentRepository } from './repositories/claim-payment.repository';
import { AuthData } from 'src/utils/auth.strategy';
import {
  ClaimPaymentStatus,
  IClaimPayment,
  IHmoClaimSummary,
  UserRoles,
} from 'src/utils/types';
import { QueryDto } from 'src/config/dto/query.dto';
import {
  AddClaimNoteDto,
  ClaimPaymentQueryDto,
  CreateClaimPaymentDto,
  FilterQueryDto,
  FlagDiscrepancyDto,
} from './dto/claim-payment.dto';
import { NotificationService } from 'src/notification/notification.service';
import { UserRepository } from 'src/user/repositories/user.repository';
import { ProviderClaimRepository } from 'src/claim/repositories/provider-claim.repository';
import { Parser } from 'json2csv';
import { Response } from 'express';
import { Between } from 'typeorm';
import { NoteRepository } from 'src/claim/repositories/note.repository';

@Injectable()
export class PaymentService {
  constructor(
    private readonly claimPaymentRepository: ClaimPaymentRepository,
    private readonly providerClaimRepository: ProviderClaimRepository,
    private readonly notificationService: NotificationService,
    private readonly userRepository: UserRepository,
    private readonly noteRepository: NoteRepository,
  ) {}
  async getClaimsPaymentStatusForHospital(
    authData: AuthData,
    query: QueryDto,
  ): Promise<IClaimPayment[]> {
    try {
      const { page, limit } = query;
      const offset = (page - 1) * limit;
      const claims = await this.claimPaymentRepository.find({
        where: { providerClaim: { hospital: { id: authData.hospitalId } } },
        skip: offset,
        take: limit,
      });

      return claims.map((claim) => {
        const status =
          claim.amountPaid === claim.amountExpected
            ? ClaimPaymentStatus.PAID
            : claim.amountPaid > 0
              ? ClaimPaymentStatus.PARTIALLY_PAID
              : ClaimPaymentStatus.UNPAID;

        return {
          claimId: claim.id,
          amountExpected: claim.amountExpected,
          amountPaid: claim.amountPaid,
          paymentDate: claim.paymentDate,
          hmoName: claim.providerClaim.hmo.name,
          status,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch claims payment status for hospital: ${error.message}`,
      );
    }
  }

  async filterClaims(
    authData: AuthData,
    query: QueryDto & ClaimPaymentQueryDto,
  ): Promise<IClaimPayment[]> {
    try {
      const { page, limit, status, hmoName, startDate, endDate } = query;
      const offset = (page - 1) * limit;

      const where: any = {
        providerClaim: { hospital: { id: authData.hospitalId } },
      };

      if (status) {
        where.amountPaid =
          status === ClaimPaymentStatus.PAID
            ? where.amountExpected
            : status === ClaimPaymentStatus.PARTIALLY_PAID
              ? { $gt: 0, $lt: where.amountExpected }
              : 0;
      }

      if (hmoName) {
        where.hmoName = hmoName;
      }

      if (startDate || endDate) {
        where.paymentDate = {};
        if (startDate) where.paymentDate.$gte = new Date(startDate);
        if (endDate) where.paymentDate.$lte = new Date(endDate);
      }

      const claims = await this.claimPaymentRepository.find({
        where,
        skip: offset,
        take: limit,
      });

      return claims.map((claim) => {
        const status =
          claim.amountPaid === claim.amountExpected
            ? ClaimPaymentStatus.PAID
            : claim.amountPaid > 0
              ? ClaimPaymentStatus.PARTIALLY_PAID
              : ClaimPaymentStatus.UNPAID;

        return {
          claimId: claim.id,
          amountExpected: claim.amountExpected,
          amountPaid: claim.amountPaid,
          paymentDate: claim.paymentDate,
          hmoName: claim.providerClaim.hmo.name,
          status,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to filter claims: ${error.message}`,
      );
    }
  }

  async flagDiscrepancy(
    claimId: string,
    payload: FlagDiscrepancyDto,
    authData: AuthData,
  ): Promise<void> {
    const queryRunner =
      this.claimPaymentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { reason, alapayAdminId } = payload;

      const claim = await queryRunner.manager.findOne(
        this.claimPaymentRepository.target,
        {
          where: {
            id: claimId,
            providerClaim: { hospital: { id: authData.hospitalId } },
          },
        },
      );

      if (!claim) {
        throw new InternalServerErrorException('Claim not found');
      }

      if (claim.amountPaid === claim.amountExpected) {
        throw new ForbiddenException(
          'Claim payment matches the expected amount and cannot be flagged',
        );
      }

      // Check for Alapay admin
      const alapayAdmin = await queryRunner.manager.findOne(
        this.userRepository.target,
        {
          where: {
            id: alapayAdminId,
            role: { permission: UserRoles.ALAPAY_ADMIN },
          },
        },
      );

      if (!alapayAdmin) {
        throw new NotFoundException(
          'Invalid Alapay admin ID or user not found',
        );
      }

      claim.isFlagged = true;
      claim.flagReason = reason;
      claim.flaggedBy = authData.id;

      await queryRunner.manager.save(this.claimPaymentRepository.target, claim);

      // Notify Admins and Claims Officers
      await this.notificationService.sendNotification(
        { user: alapayAdmin },
        reason,
        `Claim ${claimId} for ${claim.providerClaim.hospital.name} has been flagged for discrepancy.`,
        queryRunner,
      );

      await this.notificationService.sendNotification(
        { hmo: claim.providerClaim.hmo },
        reason,
        `Claim ${claimId} for ${claim.providerClaim.hospital.name} has been flagged for discrepancy.`,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to flag discrepancy for claim: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createClaimPayment(
    payload: CreateClaimPaymentDto,
    authData: AuthData,
  ): Promise<void> {
    const queryRunner =
      this.providerClaimRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { claimId, amount, paymentDate } = payload;

    if (amount <= 0) {
      throw new ForbiddenException(`Amount must be greater than 0`);
    }
    if (paymentDate > new Date()) {
      throw new ForbiddenException(`Payment date cannot be in the future`);
    }

    try {
      const claim = await queryRunner.manager.findOne(
        this.providerClaimRepository.target,
        {
          where: {
            id: claimId,
            hospital: { id: authData.hospitalId },
          },
        },
      );

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      const newClaimPayment = this.claimPaymentRepository.create({
        amountExpected: amount,
        amountPaid: amount,
        paymentDate,
      });

      newClaimPayment.providerClaim = claim;
      newClaimPayment.createdBy = `${authData.firstName} ${authData.lastName}`;

      await queryRunner.manager.save(
        this.claimPaymentRepository.target,
        newClaimPayment,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to create claim payment: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async downloadPaymentReports(
    authData: AuthData,
    query: QueryDto & ClaimPaymentQueryDto,
    res: Response,
  ): Promise<void> {
    try {
      const { status, hmoName, startDate, endDate } = query;

      const where: any = {
        providerClaim: { hospital: { id: authData.hospitalId } },
      };

      if (status) {
        where.amountPaid =
          status === ClaimPaymentStatus.PAID
            ? where.amountExpected
            : status === ClaimPaymentStatus.PARTIALLY_PAID
              ? { $gt: 0, $lt: where.amountExpected }
              : 0;
      }

      if (hmoName) {
        where.hmoName = hmoName;
      }

      if (startDate || endDate) {
        where.paymentDate = {};
        if (startDate) where.paymentDate.$gte = new Date(startDate);
        if (endDate) where.paymentDate.$lte = new Date(endDate);
      }

      const claims = await this.claimPaymentRepository.find({ where });

      const reportData = claims.map((claim) => ({
        claimId: claim.id,
        hmoName: claim.providerClaim.hmo.name,
        amountExpected: claim.amountExpected,
        amountPaid: claim.amountPaid,
        status:
          claim.amountPaid === claim.amountExpected
            ? ClaimPaymentStatus.PAID
            : claim.amountPaid > 0
              ? ClaimPaymentStatus.PARTIALLY_PAID
              : ClaimPaymentStatus.UNPAID,
        paymentDate: claim.paymentDate,
      }));

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(reportData);

      res.header('Content-Type', 'text/csv');
      res.attachment('payment-reports.csv');
      res.send(csv);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to download payment reports: ${error.message}`,
      );
    }
  }

  async generateHmoPaymentSummary(
    authData: AuthData,
    query: FilterQueryDto,
  ): Promise<IHmoClaimSummary[]> {
    try {
      const { startDate, endDate } = query;

      const claims = await this.claimPaymentRepository.find({
        where: {
          providerClaim: { hospital: { id: authData.hospitalId } },
          paymentDate: Between(startDate, endDate),
        },
        relations: ['providerClaim', 'providerClaim.hmo'],
      });

      const summary = claims.reduce((acc, claim) => {
        const hmoName = claim.providerClaim.hmo.name;
        if (!acc[hmoName]) {
          acc[hmoName] = {
            hmoName,
            totalClaims: 0,
            totalPaid: 0,
            outstandingBalance: 0,
          };
        }

        acc[hmoName].totalClaims += 1;
        acc[hmoName].totalPaid += claim.amountPaid;
        acc[hmoName].outstandingBalance +=
          claim.amountExpected - claim.amountPaid;

        return acc;
      }, {});

      return Object.values(summary);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate HMO payment summary: ${error.message}`,
      );
    }
  }

  async addInternalNote(
    payload: AddClaimNoteDto,
    authData: AuthData,
  ): Promise<void> {
    const queryRunner =
      this.providerClaimRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { claimId, note } = payload;

      const claim = await queryRunner.manager.findOne(
        this.providerClaimRepository.target,
        {
          where: {
            id: claimId,
            hospital: { id: authData.hospitalId },
          },
        },
      );

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      const user = await queryRunner.manager.findOne(
        this.userRepository.target,
        {
          where: { id: authData.id },
        },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newNote = this.noteRepository.create({
        note,
        providerClaim: { id: claim.id },
        user: { id: user.id },
      });

      const savedNote = await queryRunner.manager.save(
        this.noteRepository.target,
        newNote,
      );

      if (!claim.notes) {
        claim.notes = [];
      }

      claim.notes.push(savedNote);

      await queryRunner.manager.save(
        this.providerClaimRepository.target,
        claim,
      );

      await this.notificationService.sendNotification(
        { hmo: claim.hmo },
        note,
        `Internal note added to claim ${claimId} by ${user.firstName} ${user.lastName}`,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to add internal note: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
