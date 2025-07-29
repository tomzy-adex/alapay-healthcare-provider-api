import { Injectable, NotFoundException } from '@nestjs/common';
import { HmoRepository } from 'src/hmo/repositories/hmo.repository';
import { NotificationService } from 'src/notification/notification.service';
import { AuthData } from 'src/utils/auth.strategy';
import {
  FilterProviderClaimDto,
  ProviderClaimDto,
  UpdateProviderClaimDto,
} from './dto/provider-claim.dto';
import { ProviderClaimRepository } from './repositories/provider-claim.repository';
import { HmoService } from 'src/hmo/hmo.service';
import { NoteRepository } from './repositories/note.repository';

@Injectable()
export class ClaimService {
  constructor(
    private readonly providerClaimRepository: ProviderClaimRepository,
    private readonly hmoRepository: HmoRepository,
    private readonly hmoService: HmoService,
    private readonly notificationService: NotificationService,
    private readonly noteRepository: NoteRepository,
  ) {}

  async submitClaim(payload: ProviderClaimDto, authData: AuthData) {
    const queryRunner =
      this.providerClaimRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        enrolleeNo,
        serviceBreakdown,
        documents,
        diagnosis,
        testResults,
        dischargeSummary,
        hmoId,
        preAuthRequestId,
      } = payload;

      const enrollee =
        await this.hmoService.checkEnrolleeEligibility(enrolleeNo);
      if (!enrollee.status) {
        throw new NotFoundException('Enrollee not found');
      }
      const hmo = await this.hmoRepository.findOne({
        where: { id: hmoId },
      });

      if (!hmo) {
        throw new NotFoundException('HMO not found');
      }

      const claimReference = `CLAIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const claim = this.providerClaimRepository.create({
        enrolleeNo,
        serviceBreakdown,
        documents,
        diagnosis,
        testResults,
        dischargeSummary,
        claimReference,
        hmo: { id: hmo.id },
        hospital: { id: authData.hospitalId },
        request: { id: preAuthRequestId },
      });

      // Save the claim within the transaction
      const claimData = await queryRunner.manager.save(claim);

      if (payload.note) {
        const note = this.noteRepository.create({
          providerClaim: { id: claimData.id },
          note: payload.note,
          user: {
            id: authData.id,
          },
        });

        const savedNote = await queryRunner.manager.save(note);

        claimData.notes.push(savedNote);
        await queryRunner.manager.save(claimData);
      }

      const message = `A new claim has been submitted for enrollee ${enrolleeNo} with reference ${claimReference}.`;

      // Notify the HMO for review
      await this.notificationService.sendNotification(
        { hmo: enrollee.data },
        message,
        'Claim Submission',
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Claim submitted successfully',
        status: true,
        data: claimData,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error submitting claim:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async respondToClaimQuery(
    claimId: string,
    payload: UpdateProviderClaimDto,
    authData: AuthData,
  ) {
    const queryRunner =
      this.providerClaimRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claim = await this.providerClaimRepository.findOne({
        where: { id: claimId },
        relations: ['hmo', 'hospital'],
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.hospital.id !== authData.hospitalId) {
        throw new NotFoundException('Unauthorized to respond to this claim');
      }

      // Save the updated claim within the transaction
      const updatedClaim = await queryRunner.manager.save(payload);

      const message = `A response has been submitted for the queried claim with reference ${claim.claimReference}.`;

      // Notify the HMO about the response
      await this.notificationService.sendNotification(
        { hmo: claim.hmo },
        message,
        'Claim Query Response',
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Claim query response submitted successfully',
        status: true,
        data: updatedClaim,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error responding to claim query:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async trackClaimPayments(
    hospitalId: string,
    filters: { hmoId?: string; date?: string },
  ) {
    try {
      const queryBuilder = this.providerClaimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.hmo', 'hmo')
        .where('claim.hospital.id = :hospitalId', { hospitalId });

      if (filters.hmoId) {
        queryBuilder.andWhere('claim.hmo.id = :hmoId', {
          hmoId: filters.hmoId,
        });
      }

      if (filters.date) {
        queryBuilder.andWhere('DATE(claim.createdAt) = :date', {
          date: filters.date,
        });
      }

      const claims = await queryBuilder.getMany();

      return {
        message: 'Claims retrieved successfully',
        status: true,
        data: claims.map((claim) => ({
          id: claim.id,
          enrolleeNo: claim.enrolleeNo,
          claimReference: claim.claimReference,
          status: claim.status,
          hmoName: claim.hmo.name,
          createdAt: claim.createdAt,
        })),
      };
    } catch (error) {
      console.error('Error tracking claim payments:', error);
      throw error;
    }
  }

  async downloadRemittanceAdvice(claimId: string) {
    try {
      const claim = await this.providerClaimRepository.findOne({
        where: { id: claimId },
        relations: ['hmo', 'hospital'],
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      // Generate remittance advice (mocked for now)
      const remittanceAdvice = {
        claimReference: claim.claimReference,
        enrolleeNo: claim.enrolleeNo,
        hmoName: claim.hmo.name,
        hospitalName: claim.hospital.name,
        status: claim.status,
        amount: Array.isArray(claim.serviceBreakdown)
          ? claim.serviceBreakdown.reduce(
              (sum, service) => sum + service.amount,
              0,
            )
          : 0,
      };

      return {
        message: 'Remittance advice generated successfully',
        status: true,
        data: remittanceAdvice,
      };
    } catch (error) {
      console.error('Error downloading remittance advice:', error);
      throw error;
    }
  }

  async viewSubmittedClaims(
    hospitalId: string,
    filters: FilterProviderClaimDto,
  ) {
    try {
      const queryBuilder = this.providerClaimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.hmo', 'hmo')
        .where('claim.hospital.id = :hospitalId', { hospitalId });

      if (filters.hmoId) {
        queryBuilder.andWhere('claim.hmo.id = :hmoId', {
          hmoId: filters.hmoId,
        });
      }

      if (filters.date) {
        queryBuilder.andWhere('DATE(claim.createdAt) = :date', {
          date: filters.date,
        });
      }

      if (filters.enrolleeNo) {
        queryBuilder.andWhere('claim.enrolleeNo = :enrolleeNo', {
          enrolleeNo: filters.enrolleeNo,
        });
      }

      const claims = await queryBuilder.getMany();

      return {
        message: 'Submitted claims retrieved successfully',
        status: true,
        data: claims.map((claim) => ({
          id: claim.id,
          enrolleeNo: claim.enrolleeNo,
          claimReference: claim.claimReference,
          status: claim.status,
          hmoName: claim.hmo.name,
          createdAt: claim.createdAt,
        })),
      };
    } catch (error) {
      console.error('Error viewing submitted claims:', error);
      throw error;
    }
  }

  async exportClaimsHistory(
    hospitalId: string,
    filters: FilterProviderClaimDto,
  ) {
    try {
      const queryBuilder = this.providerClaimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.hmo', 'hmo')
        .where('claim.hospital.id = :hospitalId', { hospitalId });

      if (filters.hmoId) {
        queryBuilder.andWhere('claim.hmo.id = :hmoId', {
          hmoId: filters.hmoId,
        });
      }

      if (filters.date) {
        queryBuilder.andWhere('DATE(claim.createdAt) = :date', {
          date: filters.date,
        });
      }

      if (filters.enrolleeNo) {
        queryBuilder.andWhere('claim.enrolleeNo = :enrolleeNo', {
          enrolleeNo: filters.enrolleeNo,
        });
      }

      const claims = await queryBuilder.getMany();

      // Generate CSV data (mocked for now)
      const csvData = claims
        .map(
          (claim) =>
            `${claim.id},${claim.enrolleeNo},${claim.claimReference},${claim.status},${claim.hmo.name},${claim.createdAt}`,
        )
        .join('\n');

      return {
        message: 'Claims history exported successfully',
        status: true,
        data: csvData,
      };
    } catch (error) {
      console.error('Error exporting claims history:', error);
      throw error;
    }
  }

  async viewClaimDetails(claimId: string, hospitalId: string) {
    try {
      const claim = await this.providerClaimRepository.findOne({
        where: { id: claimId },
        relations: ['hmo', 'hospital'],
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.hospital.id !== hospitalId) {
        throw new NotFoundException('Unauthorized to view this claim');
      }

      // Fetch user details using enrolleeNo
      const user = await this.hmoService.checkEnrolleeEligibility(
        claim.enrolleeNo,
      );

      if (!user.status) {
        throw new NotFoundException(
          'User not found for the provided enrollee number',
        );
      }

      // Construct timeline and detailed response
      const timeline = [
        { status: 'Submitted', date: claim.createdAt },
        ...claim.status, // Assuming statusUpdates is an array of status changes
      ];

      const claimDetails = {
        id: claim.id,
        enrolleeNo: claim.enrolleeNo,
        enrolleeName: `${user.data.user[0].firstName} ${user.data.user[0].lastName}`,
        hospitalName: claim.hospital.name,
        claimReference: claim.claimReference,
        documents: claim.documents,
        diagnosis: claim.diagnosis,
        testResults: claim.testResults,
        dischargeSummary: claim.dischargeSummary,
        serviceBreakdown: claim.serviceBreakdown,
        amount: Array.isArray(claim.serviceBreakdown)
          ? claim.serviceBreakdown.reduce(
              (sum, service) => sum + service.amount,
              0,
            )
          : 0,
        hmo: {
          id: claim.hmo.id,
          name: claim.hmo.name,
          contact: claim.hmo.phoneNumber, // Assuming contact details are available
        },
        timeline,
      };

      return {
        message: 'Claim details retrieved successfully',
        status: true,
        data: claimDetails,
      };
    } catch (error) {
      console.error('Error viewing claim details:', error);
      throw error;
    }
  }

  async getClaimsHistory(hospitalId: string, filters: FilterProviderClaimDto) {
    try {
      const queryBuilder = this.providerClaimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.hmo', 'hmo')
        .where('claim.hospital.id = :hospitalId', { hospitalId });

      if (filters.hmoId) {
        queryBuilder.andWhere('claim.hmo.id = :hmoId', {
          hmoId: filters.hmoId,
        });
      }

      if (filters.date) {
        queryBuilder.andWhere('DATE(claim.createdAt) = :date', {
          date: filters.date,
        });
      }

      if (filters.enrolleeNo) {
        queryBuilder.andWhere('claim.enrolleeNo = :enrolleeNo', {
          enrolleeNo: filters.enrolleeNo,
        });
      }

      const claims = await queryBuilder.getMany();

      return {
        message: 'Claims history retrieved successfully',
        status: true,
        data: claims.map((claim) => ({
          id: claim.id,
          enrolleeNo: claim.enrolleeNo,
          claimReference: claim.claimReference,
          status: claim.status,
          hmoName: claim.hmo.name,
          createdAt: claim.createdAt,
          serviceBreakdown: claim.serviceBreakdown,
          amount: Array.isArray(claim.serviceBreakdown)
            ? claim.serviceBreakdown.reduce(
                (sum, service) => sum + service.amount,
                0,
              )
            : 0,
        })),
      };
    } catch (error) {
      console.error('Error retrieving claims history:', error);
      throw error;
    }
  }

  async linkClaimToAuthorization(
    claimId: string,
    authorizationCode: string,
    authData: AuthData,
  ) {
    const queryRunner =
      this.providerClaimRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claim = await this.providerClaimRepository.findOne({
        where: { id: claimId },
        relations: ['hmo', 'hospital'],
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.hospital.id !== authData.hospitalId) {
        throw new NotFoundException('Unauthorized to link this claim');
      }

      const authorization = await this.providerClaimRepository.findOne({
        where: { authorizationCode, hmo: { id: claim.hmo.id } },
      });

      if (!authorization) {
        throw new NotFoundException(
          'Authorization not found or does not belong to the same HMO',
        );
      }

      if (authorization.enrolleeNo !== claim.enrolleeNo) {
        throw new NotFoundException(
          'Authorization does not belong to the same enrollee',
        );
      }

      claim.authorizationCode = authorizationCode;

      // Save the updated claim within the transaction
      const updatedClaim = await queryRunner.manager.save(claim);

      await queryRunner.commitTransaction();

      return {
        message: 'Claim linked to authorization successfully',
        status: true,
        data: updatedClaim,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error linking claim to authorization:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
