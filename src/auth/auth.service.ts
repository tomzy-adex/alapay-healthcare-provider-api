import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { CacheService } from '../cache/cache.service';
import { EncryptionService } from '../utils/encryption.service';
import { UserRepository } from '../user/repositories/user.repository';
import { EmailService } from '../email/email.service';
import { checkAuthUser, transformRoleType } from '../utils/helpers';
import { decode } from 'jsonwebtoken';
import {
  ResetPasswordDto,
  UpdateAdminDto,
  UserLogindto,
} from 'src/auth/dto/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly encryptionService: EncryptionService,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async login(payload: UserLogindto) {
    const { email, password } = payload;
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });

      if (!user) {
        throw new BadRequestException('Invalid email or password.');
      }

      await checkAuthUser(user);

      if (!user.isEmailVerified) {
        const userType = transformRoleType(user.role.permission);
        const subject = `Verify your ${userType} Account`;
        await this.emailService.sendVerificationEmail(
          email,
          user.firstName,
          subject,
        );

        throw new BadRequestException(
          `Please, verify your account. A verification code has been sent to ${email}`,
        );
      }

      const isPasswordOkay = await this.encryptionService.compare(
        password,
        user.password,
      );

      if (!isPasswordOkay) {
        throw new BadRequestException('Invalid email or password.');
      }

      const sessId = v4();

      delete user.password;
      await this.cacheService.set(`${user.role.permission}::${sessId}`, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role.permission,
        hospitalId: user.hospitals[0].id,
        sessId,
      });

      const { id, firstName, lastName, isEmailVerified, status, role } = user;

      return {
        message: 'Login successful.',
        status: true,
        data: {
          id,
          firstName,
          lastName,
          email,
          isEmailVerified,
          status,
          role: role.permission,
        },
        token: this.encryptionService.generateToken({
          sub: sessId,
          type: user.role.permission,
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(token: string) {
    // Add the token to the blacklist
    const payload = decode(token) as any;
    if (!payload) throw new NotFoundException('Invalid token');

    const blacklisted = await this.cacheService.isBlacklisted(token);
    await this.cacheService.remove(`${payload.type}::${payload.sub}`);

    if (blacklisted)
      throw new BadRequestException('You are already logged out');

    const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
    await this.cacheService.addToBlacklist(token, expiresIn);

    return { success: true, message: 'Log out successful.' };
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      const { email } = payload;
      const user = await this.userRepository.findOneBy({ email });
      if (!user) return null;
      const subject = 'Password Reset Code';

      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        subject,
      );

      return {
        success: true,
        message: `Password reset email sent successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Forgot password could not be completed:',
        error,
      );
    }
  }

  async changePassword(payload: UpdateAdminDto) {
    try {
      const { code, password } = payload;
      const redisClient = this.cacheService;

      const email = await redisClient.get(`verify-account:${code}`);

      if (!email) {
        throw new BadRequestException('Invalid or expired verification link.');
      }

      const user = await this.userRepository.findOneBy({
        email: email as string,
      });

      if (!user) throw new NotFoundException('User does not exist.');

      const hashedPassword = await this.encryptionService.hash(password);

      await this.userRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
        },
      );
      await redisClient.remove(`verify-account:${code}`);

      return {
        success: true,
        message: `Password updated successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Change password could not be completed:',
        error,
      );
    }
  }
}
