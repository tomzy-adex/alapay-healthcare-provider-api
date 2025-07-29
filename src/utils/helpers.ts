import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { User } from 'src/user/entities/user.entity';
import { UserRoles, ProcessStatus, Status } from './types';
import { v4 as uuidv4 } from 'uuid';
/**
 * Replaces dashes with spaces and capitalizes the first letter of each word.
 * @param {string} input - The string to transform (e.g., "hmo-admin").
 * @returns {string} The transformed string (e.g., "Hmo Admin").
 */
export const transformRoleType = (input: string): string => {
  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generates a 6-digit OTP (One-Time Password) with digits only.
 *
 * @returns {Promise<string>} - The generated OTP.
 * @throws {InternalError} - If OTP generation fails.
 */
export const generateOtp = async (): Promise<string> => {
  try {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new InternalServerErrorException('OTP generation failed.');
  }
};

export const checkAuthUser = async (user: User) => {
  if (
    user.role.permission !== UserRoles.HEALTHCARE_PROVIDER_ADMIN &&
    user.role.permission !== UserRoles.HEALTHCARE_CLAIM_OFFICER &&
    user.role.permission !== UserRoles.HEALTHCARE_FINANCE_OFFICER
  )
    throw new BadRequestException(
      'You are not authorized to perform this action.',
    );

  if (user.status !== ProcessStatus.APPROVED)
    throw new ForbiddenException(
      `Your account is ${user.status}. Contact support.`,
    );

  if (user.accountStatus !== Status.ACTIVE)
    throw new ForbiddenException(
      `Your account is ${user.accountStatus}. Contact support.`,
    );
};

export const calculateOverdueDate = (startDate: Date, overdueDays: number) => {
  // Convert startDate to Date object if it's a string
  const start = new Date(startDate);

  // Add the overdue days
  start.setDate(start.getDate() + overdueDays);

  // Format as YYYY-MM-DD (optional)
  return start.toISOString().split('T')[0];
};

/**
 * Generates a dynamic 6-digit enrollee ID based on the date of birth and current timestamp.
 *
 * @param {Date} dob - The date of birth of the enrollee.
 * @returns {string} - The generated 6-digit enrollee ID.
 */
export const generateEnrolleeId = (dob: Date): string => {
  const uniqueId = uuidv4().replace(/-/g, '').slice(-6);
  const dobString = dob.toISOString().split('T')[0].replace(/-/g, '');
  const enrolleeId = `${dobString}${uniqueId}`.slice(-6);
  return enrolleeId;
};
