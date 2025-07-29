import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { EmailService } from 'src/email/email.service';
import { HmoRepository } from 'src/hmo/repositories/hmo.repository';
import { RoleService } from 'src/role/role.service';
import { EncryptionService } from 'src/utils/encryption.service';
import { UserRepository } from './repositories/user.repository';
import { Hmo } from 'src/hmo/entities/hmo.entity';
import { transformRoleType } from 'src/utils/helpers';
import { CreateHmoadminDto, CreateUserDto } from './dto/create-user.dto';
import { AccountApprovalDto, UpdateUserDto } from './dto/update-user.dto';
import {
  INotificationType,
  OnboardingType,
  ProcessStatus,
  Status,
  UserRoles,
} from 'src/utils/types';
import { config } from 'src/config';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { OnboardAccountDto } from './dto/onboard-user.dto';
import { Hospital } from 'src/hmo/entities/hospital.entity';
import { HospitalRepository } from 'src/hmo/repositories/hospital.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { CreateHospitalDto } from 'src/hmo/dto/hospital.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly cacheService: CacheService,
    private readonly roleService: RoleService,
    private readonly emailService: EmailService,
    private readonly hmoRepository: HmoRepository,
    private readonly hospitalRepository: HospitalRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createUser(payload: CreateUserDto) {
    try {
      const user = this.userRepository;

      const { email, password, roleId, phoneNumber } = payload;

      const role = await this.roleService.getRoleById(roleId);
      const hashedPassword = await this.encryptionService.hash(password);
      let hmo: Hmo;
      let healthcare: Hospital;

      if (!user) throw new BadRequestException('User model is not loaded.');

      if (!role) throw new NotFoundException('Role does not exist.');

      if (payload.hmoId) {
        hmo = await this.hmoRepository.findOneBy({ id: payload.hmoId });

        if (!hmo) throw new NotFoundException('HMO does not exist.');
      }

      if (phoneNumber) {
        const isPhoneNumber = await user.findOneBy({ phoneNumber });
        if (isPhoneNumber)
          throw new BadRequestException(
            'User with this phone number already exist.',
          );
      }

      if (payload.hospitalId) {
        healthcare = await this.hospitalRepository.findOneBy({
          id: payload.hospitalId,
        });

        if (!healthcare)
          throw new NotFoundException('Healthcare provider does not exist.');
      }

      const isUser = await user.findOneBy({ email });

      if (isUser)
        throw new BadRequestException('User with this email already exist.');

      if (isUser?.phoneNumber === payload.phoneNumber) {
        throw new BadRequestException(
          'User with this phone number already exist.',
        );
      }

      const createdUser = await user.save({
        ...payload,
        email: email.toLocaleLowerCase(),
        password: hashedPassword,
        role: { id: role.data.id },
        ...(payload.hmoId ? { hmo: { id: hmo.id } } : {}),
        ...(payload.hospitalId ? { hospitals: [{ id: healthcare.id }] } : {}),
      });

      const adminType = transformRoleType(role.data.permission);
      const subject = `Verify your ${adminType} Account`;

      await this.emailService.sendVerificationEmail(
        email,
        createdUser.firstName,
        subject,
      );

      return {
        success: true,
        message: `${adminType} account created successfully.`,
        data: {
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          role: createdUser.role.permission,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyRegistrationToken(
    token: string,
  ): Promise<{ email: string; roleId: string } | null> {
    const redisClient = this.cacheService;
    const data = await redisClient.get(`registration:${token}`);

    if (!data) {
      throw new BadRequestException('Invalid or expired registration link.');
    }

    // Parse the stored JSON to retrieve email and roleId
    const { email, roleId } = JSON.parse(data as string);

    return { email, roleId };
  }

  async registerHealthcareProviderAdmin(
    adminRoleId: string,
    token: string,
    payload: CreateHmoadminDto,
    onboardingType: OnboardingType,
  ) {
    try {
      const { email, roleId } = await this.verifyRegistrationToken(token);

      if (!email && !roleId) {
        throw new BadRequestException('Invalid or expired registration link.');
      }

      if (
        onboardingType === OnboardingType.HEALTHCARE_CLAIM_OFFICER &&
        !payload.hospitalId
      ) {
        throw new BadRequestException(
          'Hospital ID is required for claim officer registration.',
        );
      }

      if (
        onboardingType === OnboardingType.HEALTHCARE_FINANCE_OFFICER &&
        !payload.hospitalId
      ) {
        throw new BadRequestException(
          'Hospital ID is required for finance officer registration.',
        );
      }

      // Proceed to create the user with the email from the token
      const role = await this.roleService.getRoleById(roleId);

      if (adminRoleId !== role.data.id)
        throw new ForbiddenException(
          'Invalid role params or invlalid role ID query.',
        );

      const adminType = transformRoleType(role.data.permission);

      const user = await this.createUser({
        ...payload,
        roleId: role.data.id,
      });

      await this.cacheService.remove(`registration:${token}`);

      return {
        success: true,
        message: `${adminType} registered successfully.`,
        data: {
          id: user.data.id,
          email: user.data.email,
          role: user.data.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async registerHealthcareProvider(
    adminRoleId: string,
    token: string,
    payload: CreateHospitalDto,
  ) {
    try {
      const { email, roleId } = await this.verifyRegistrationToken(token);
      const role = await this.roleService.getRoleById(roleId);
      const hospital = this.hospitalRepository;

      if (!email && !roleId) {
        throw new BadRequestException('Invalid or expired registration link.');
      }

      if (!role) throw new NotFoundException('Role does not exist.');

      const isHospital = await this.hospitalRepository.findOneBy({ email });

      if (isHospital)
        throw new BadRequestException(
          'Hospital with this email already exist.',
        );

      if (isHospital?.phone === payload.phone)
        throw new BadRequestException(
          'Hospital with this phone number already exist.',
        );

      if (adminRoleId !== role.data.id)
        throw new ForbiddenException(
          'Invalid role params or invlalid role ID query.',
        );

      const created = await hospital.save({
        ...payload,
        status: ProcessStatus.APPROVED,
        accountStatus: Status.ACTIVE,
      });

      return {
        success: true,
        message: `Hospital account created registered successfully.`,
        data: {
          id: created.id,
          email: created.email,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyUser(code: string) {
    try {
      const user = this.userRepository;
      const redisClient = this.cacheService;

      const email = await redisClient.get(`verify-account:${code}`);

      if (!email) {
        throw new BadRequestException('Invalid or expired verification code.');
      }

      const isUser = await user.findOneBy({ email: email as string });

      if (!isUser) throw new NotFoundException('User does not exist.');

      await user.update({ id: isUser.id }, { isEmailVerified: true });

      await redisClient.remove(`verify-account:${code}`);

      return {
        success: true,
        message: `Account verified successfully.`,
      };
    } catch (error) {
      console.error('Error verifying user account:', error);
      throw new InternalServerErrorException(
        'User account could not be verified',
      );
    }
  }

  async updateAdminProfile(id: string, payload: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) throw new NotFoundException('User not found');

      await this.userRepository.update({ id }, { ...payload });

      return {
        success: true,
        message: 'Profile updated successfully sent successfully.',
      };
    } catch (error) {
      throw error;
    }
  }

  async getAdminById(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role', 'hmo'],
      });

      if (!user) throw new NotFoundException('User not found');

      if (
        id !== user.id ||
        user.role.permission !== UserRoles.HEALTHCARE_PROVIDER_ADMIN
      ) {
        throw new BadRequestException(
          'You are not authorzed to perform this action',
        );
      }

      delete user.password;

      return {
        success: true,
        message: 'User fetched successfully.',
        data: user,
      };
    } catch (error) {
      console.error('Error fetching user account:', error);
      throw new InternalServerErrorException(
        'User account could not be fetched.',
      );
    }
  }

  async generateRegistrationToken(
    email: string,
    roleId: string,
  ): Promise<string> {
    const token = this.encryptionService.generateToken({ email, roleId });
    const redisClient = this.cacheService;

    const data = JSON.stringify({ email, roleId });

    // Store the token in Redis with a TTL (e.g., 24 hours)
    await redisClient.set(`registration:${token}`, data);

    return token;
  }

  async sendRegistrationLink(
    email: string,
    roleId: string,
    onboardingType: OnboardingType,
  ): Promise<void> {
    const token = await this.generateRegistrationToken(email, roleId);
    const role = await this.roleService.getRoleById(roleId);

    if (!role) throw new NotFoundException('Role does not exist.');

    const url = config.healthProviderUrl;

    const link = `${url}/api/v1/admin/${roleId}/onboard-${onboardingType}-account?token=${token}`;

    const text = `Please use the following link to complete your registration: <a href="${link}">Link</a>`;
    const adminType = transformRoleType(onboardingType);
    const subject = `${adminType} Registration`;

    const emailPayload: SendEmailDto = { to: email, subject, html: text };

    // Send email (assume an email service is set up)
    await this.emailService.sendEmail(emailPayload);
  }

  async onboardAccount(payload: OnboardAccountDto) {
    const { emails, roleId, onboardingType } = payload;

    for (const email of emails) {
      try {
        await this.sendRegistrationLink(email, roleId, onboardingType);
      } catch (error) {
        console.error(
          `Failed to send registration link to ${email}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to send registration link',
        );
      }
    }

    return {
      success: true,
      message: 'Registration link(s) sent successfully.',
    };
  }

  async accountApproval(id: string, payload: AccountApprovalDto) {
    try {
      const { status, message } = payload;
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role'],
      });

      if (!user) throw new NotFoundException('User not found.');

      if (user.status === ProcessStatus.APPROVED)
        throw new ForbiddenException('This account has been approved.');

      const adminType = transformRoleType(user.role.permission);

      const notification: INotificationType = {
        title: `${adminType} has been ${status}.`,
        message,
      };

      const emailPayload: SendEmailDto = {
        to: user.email,
        subject: notification.title,
        html: `Hello ${user.firstName},
        <br/><br/>
        Your ${adminType} account has been ${status}. See more information below:
        <br/><br/>
       <b>${message}</b>
        `,
      };

      const accountStatus =
        status === ProcessStatus.APPROVED ? Status.ACTIVE : Status.DORMANT;

      await this.userRepository.update({ id }, { status, accountStatus });
      await this.notificationRepository.save({ ...notification, user: { id } });
      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: `${user.firstName} ${adminType} account was successfully ${status}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async deactivateAccount(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) throw new NotFoundException('User not found.');

      if (user.accountStatus === Status.SUSPENDED)
        throw new ForbiddenException('This account is already deactivated.');

      await this.userRepository.update(
        { id },
        { accountStatus: Status.SUSPENDED },
      );

      return {
        success: true,
        message: 'Account deactivated successfully.',
      };
    } catch (error) {
      throw error;
    }
  }
}
