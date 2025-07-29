import { Injectable, NotFoundException } from '@nestjs/common';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { EmailService } from 'src/email/email.service';
import { Hmo } from 'src/hmo/entities/hmo.entity';
import { User } from 'src/user/entities/user.entity';
import { QueryRunner } from 'typeorm';
import { NotificationRepository } from './repositories/notification.repository';
import { Hospital } from 'src/hmo/entities/hospital.entity';
import { AuthData } from 'src/utils/auth.strategy';
import { QueryDto } from 'src/config/dto/query.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async sendNotification(
    user: { user?: User; hmo?: Hmo; hospital?: Hospital },
    message: string,
    title: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const emailPayload: SendEmailDto = {
      to: user.user
        ? user.user.email
          ? user.hospital.email
          : user.hmo.email
        : '',
      subject: title,
      html: message,
    };

    const notification = this.notificationRepository.create({
      title,
      message,
      user: user.user,
      hmo: user.hmo,
      hospital: user.hospital,
    });

    const saved = await queryRunner.manager.save(notification);
    if (saved.id) {
      await this.emailService.sendEmail(emailPayload);
    }
  }

  async getNotifications(authData: AuthData, query: QueryDto): Promise<any> {
    try {
      const { page, limit } = query;
      const skip = (page - 1) * limit;

      const [notifications, total] =
        await this.notificationRepository.findAndCount({
          where: { hospital: { id: authData.hospitalId } },
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        });

      if (!notifications || notifications.length === 0) {
        throw new NotFoundException(
          'No notifications found for the given user ID',
        );
      }

      return {
        status: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getNotificationById(id: string, authData: AuthData): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          id,
          hospital: { id: authData.hospitalId },
        },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      return {
        status: true,
        message: 'Notification retrieved successfully',
        data: notification,
      };
    } catch (error) {
      throw error;
    }
  }
}
