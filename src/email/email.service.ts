import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { config } from '../config';
import { generateOtp } from '../utils/helpers';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class EmailService {
  constructor(private readonly cacheService: CacheService) {}

  async sendEmail(payload: SendEmailDto): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set up the transporter configuration using environment variables
      const transporter = nodemailer.createTransport({
        service: config.email.service,
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.auth.user,
          pass: config.email.auth.pass,
        },
        tls: {
          rejectUnauthorized: config.email.secure,
        },
      });

      const { to, subject, html } = payload;

      // Define the email options
      const mailOptions = {
        from: config.email.emailSender,
        to,
        subject,
        html,
      };

      // Send the email and handle the response
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error); // Reject the Promise on error
        } else {
          console.log(`Email sent: ${info.response} to ${to}`);
          resolve(); // Resolve the Promise on success
        }
      });
    });
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    subject: string,
  ): Promise<void> {
    try {
      const code = await generateOtp();
      const text = `Hi ${firstName},<br/> Your verification code is: ${code}.<br/> Do not share your code with anyone.`;

      const emailPayload: SendEmailDto = { to: email, subject, html: text };

      await this.cacheService.set(`verify-account:${code}`, email);

      await this.sendEmail(emailPayload);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Email could not be sent.');
    }
  }
}
