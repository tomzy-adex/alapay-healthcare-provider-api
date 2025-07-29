import { Injectable, NotFoundException } from '@nestjs/common';
import { HmoRepository } from './repositories/hmo.repository';
import {
  CreateHospitalInfoDto,
  PreAuthRequestDto,
  UpdateHospitalDto,
  UpdateHospitalInfoDto,
} from './dto/hospital.dto';
import { PreAuthRequestRepository } from './repositories/pre-auth-request.repository';
import { NotificationService } from 'src/notification/notification.service';
import { PlanSubscription } from './entities/plan-subscription.entity';
import { SearchProviderClaimDto } from 'src/claim/dto/provider-claim.dto';
import { ProviderClaimRepository } from 'src/claim/repositories/provider-claim.repository';
import { HospitalRepository } from './repositories/hospital.repository';
import { HospitalInfoRepository } from './repositories/hospital-info.repository';
import { Workbook } from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { DownloadFormat } from 'src/utils/types';
import { checkAuthUser } from 'src/utils/helpers';
import { UserRepository } from 'src/user/repositories/user.repository';

@Injectable()
export class HmoService {
  constructor(
    private readonly hmoRepository: HmoRepository,
    private readonly providerClaimRepository: ProviderClaimRepository,
    private readonly hospitalInfoRepository: HospitalInfoRepository,
    private readonly preAuthRequestRepository: PreAuthRequestRepository,
    private readonly notificationService: NotificationService,
    private readonly hospitalRepository: HospitalRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async checkEnrolleeEligibility(enrolleeNo: string) {
    try {
      // Search for enrollee in the repository
      const enrollee = await this.hmoRepository.findOne({
        where: { plans: { subscriptions: { enrolleeNo } } },
      });

      if (!enrollee) throw new NotFoundException('Enrollee not found');

      return {
        message: 'Enrollee found',
        status: true,
        data: enrollee,
      };
    } catch (error) {
      // Handle error
      console.error('Error checking enrollee eligibility:', error);
      throw error;
    }
  }

  async requestPreAuthorization(payload: PreAuthRequestDto) {
    const queryRunner =
      this.preAuthRequestRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { treatmentDetails, providerInfo, enrolleeNo } = payload;

      const enrollee = await this.checkEnrolleeEligibility(enrolleeNo);
      if (!enrollee.status) {
        throw new NotFoundException('Enrollee not found');
      }

      const preAuthRequest = this.preAuthRequestRepository.create({
        treatmentDetails,
        providerInfo,
        subscriptions: enrollee.data.user[0].subscriptions.map(
          (subscription) => ({
            ...subscription,
          }),
        ) as unknown as PlanSubscription, // Cast to 'any' if necessary to bypass type mismatch
      });

      // Save the pre-authorization request within the transaction
      const preAuthRequestData = await queryRunner.manager.save(preAuthRequest);

      const message = `A new pre-authorization request has been submitted for enrollee ${enrolleeNo}.`;

      // Notify the HMO for review
      await this.notificationService.sendNotification(
        { hmo: enrollee.data },
        message,
        'Pre-Authorization Request',
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Pre-authorization request submitted successfully',
        status: true,
        data: preAuthRequestData,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error requesting pre-authorization:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getEnrolleeTreatmentHistory(enrolleeNo: string, hospitalId: string) {
    try {
      const treatments = await this.providerClaimRepository.find({
        where: {
          enrolleeNo,
          hospital: { id: hospitalId },
        },
        relations: ['hospital', 'hmo'],
      });

      if (!treatments.length) {
        throw new NotFoundException(
          'No treatment history found for this enrollee in your facility',
        );
      }

      const treatmentHistory = treatments.map((treatment) => ({
        claimReference: treatment.claimReference,
        diagnosis: treatment.diagnosis,
        serviceBreakdown: treatment.serviceBreakdown,
        medications: treatment.testResults, // Assuming testResults includes medications
        dischargeSummary: treatment.dischargeSummary,
        hmoName: treatment.hmo.name,
        createdAt: treatment.createdAt,
      }));

      return {
        message: 'Enrollee treatment history retrieved successfully',
        status: true,
        data: treatmentHistory,
      };
    } catch (error) {
      console.error('Error retrieving enrollee treatment history:', error);
      throw error;
    }
  }

  async createHospitalInfo(
    hospitalId: string,
    info: CreateHospitalInfoDto,
    id: string,
  ) {
    const queryRunner =
      this.hospitalInfoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    await checkAuthUser(user);

    try {
      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      const hospitalInfo = this.hospitalInfoRepository.create({
        hospital,
        ...info,
      });

      // Save the hospital info within the transaction
      const createdHospitalInfo = await queryRunner.manager.save(hospitalInfo);

      const message = `New hospital information has been added for ${hospital.name}.`;

      // Notify the HMO about the new hospital information
      await this.notificationService.sendNotification(
        { hospital },
        message,
        'Hospital Info Creation',
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Hospital information created successfully',
        status: true,
        data: createdHospitalInfo,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error creating hospital information:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateProviderProfile(
    hospitalId: string,
    updates: UpdateHospitalDto,
    id: string,
  ) {
    const queryRunner =
      this.hospitalRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    await checkAuthUser(user);

    try {
      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      // Update hospital information
      Object.assign(hospital, updates);

      // Save the updated hospital profile within the transaction
      const updatedHospital = await queryRunner.manager.save(hospital);

      const message = `The hospital profile for ${hospital.name} has been updated and is pending HMO approval.`;

      // Notify the HMO for approval
      await this.notificationService.sendNotification(
        { hospital },
        message,
        'Provider Profile Update',
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        message:
          'Provider profile updated successfully and sent for HMO approval',
        status: true,
        data: updatedHospital,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error updating provider profile:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateHospitalInfo(
    hospitalId: string,
    updates: UpdateHospitalInfoDto,
    id: string,
  ) {
    const queryRunner =
      this.hospitalInfoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    await checkAuthUser(user);

    try {
      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['hospitalInfo'],
      });

      if (!hospital) throw new NotFoundException('Hospital not found');

      const hospitalInfo = await this.hospitalInfoRepository.findOne({
        where: { id: hospital.hospitalInfo.id },
        relations: ['hospital'],
      });

      if (!hospitalInfo) {
        throw new NotFoundException('Hospital information not found');
      }

      // Update hospital info
      Object.assign(hospitalInfo, updates);

      // Save the updated hospital info within the transaction
      const updatedHospitalInfo = await queryRunner.manager.save(hospitalInfo);

      const message = `The hospital information for ${hospitalInfo.hospital.name} has been updated and is pending HMO approval.`;

      // Notify the HMO for approval
      await this.notificationService.sendNotification(
        { hospital: hospitalInfo.hospital },
        message,
        'Hospital Info Update',
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        message:
          'Hospital information updated successfully and sent for HMO approval',
        status: true,
        data: updatedHospitalInfo,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error updating hospital information:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async generateReports(
    filters: SearchProviderClaimDto,
    format: DownloadFormat,
  ) {
    try {
      const queryBuilder = this.providerClaimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.hmo', 'hmo')
        .leftJoinAndSelect('claim.hospital', 'hospital');

      if (filters.date) {
        queryBuilder.andWhere('DATE(claim.createdAt) = :date', {
          date: filters.date,
        });
      }

      if (filters.status) {
        queryBuilder.andWhere('claim.status = :status', {
          status: filters.status,
        });
      }

      if (filters.patient) {
        queryBuilder.andWhere('claim.enrolleeNo = :patient', {
          patient: filters.patient,
        });
      }

      if (filters.hmoId) {
        queryBuilder.andWhere('claim.hmo.id = :hmoId', {
          hmoId: filters.hmoId,
        });
      }

      const claims = await queryBuilder.getMany();

      if (format === DownloadFormat.XLSX) {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Claims Report');

        worksheet.columns = [
          { header: 'Claim Reference', key: 'claimReference', width: 20 },
          { header: 'Enrollee No', key: 'enrolleeNo', width: 15 },
          { header: 'HMO Name', key: 'hmoName', width: 20 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Created At', key: 'createdAt', width: 20 },
        ];

        claims.forEach((claim) => {
          worksheet.addRow({
            claimReference: claim.claimReference,
            enrolleeNo: claim.enrolleeNo,
            hmoName: claim.hmo.name,
            status: claim.status,
            createdAt: claim.createdAt,
          });
        });

        const filePath = `reports/claims-report-${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(filePath);

        return {
          message: 'Report generated successfully',
          status: true,
          data: { filePath },
        };
      } else if (format === DownloadFormat.PDF) {
        const doc = new PDFDocument();
        const filePath = `reports/claims-report-${Date.now()}.pdf`;
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.fontSize(18).text('Claims Report', { align: 'center' });
        doc.moveDown();

        claims.forEach((claim) => {
          doc
            .fontSize(12)
            .text(`Claim Reference: ${claim.claimReference}`)
            .text(`Enrollee No: ${claim.enrolleeNo}`)
            .text(`HMO Name: ${claim.hmo.name}`)
            .text(`Status: ${claim.status}`)
            .text(`Created At: ${claim.createdAt}`)
            .moveDown();
        });

        doc.end();

        await new Promise<void>((resolve) =>
          writeStream.on('finish', () => resolve()),
        );

        return {
          message: 'Report generated successfully',
          status: true,
          data: { filePath },
        };
      } else {
        throw new Error('Invalid format specified');
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      throw error;
    }
  }

  async viewOrganizationInfo(hospitalId: string) {
    try {
      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['hospitalInfo', 'plans', 'hmos'],
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      const organizationInfo = {
        profile: {
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          ...hospital.hospitalInfo,
        },
        hmoPlans: hospital.plans.map((plan) => ({
          planName: plan.name,
          hmoName: plan.hmo.name,
          ...plan,
        })),
      };

      return {
        message: 'Organization information retrieved successfully',
        status: true,
        data: organizationInfo,
      };
    } catch (error) {
      console.error('Error viewing organization info:', error);
      throw error;
    }
  }
}
