import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { IAuditLog } from '../utils/types';
import { QueryDto } from 'src/config/dto/query.dto';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async logAction(payload: IAuditLog) {
    const { action, entityName, entityId, oldValue, newValue, userId } =
      payload;
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        entityName,
        entityId,
        oldValue,
        newValue,
        user: { id: userId },
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      console.error(
        `Failed to create Audit log for ${entityName} by ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to create Audit log');
    }
  }

  async getLogbyId(id: string) {
    try {
      const log = await this.auditLogRepository.findOneBy({ id });

      if (!log) throw new NotFoundException('Log not found');

      return {
        success: true,
        message: 'Log fetched successfully.',
        data: log,
      };
    } catch (error) {
      console.error(`Failed to fetch Audit log for: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch Audit log by ID');
    }
  }

  async getLogs(query: QueryDto) {
    try {
      const { page, limit } = query;
      const [logs, total] = await this.auditLogRepository.findAndCount({
        relations: ['user'],
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      if (logs.length === 0) throw new NotFoundException('Logs not found');

      return {
        success: true,
        message: 'Logs fetched successfully.',
        data: logs,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(`Failed to fetch Audit logs for: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch Audit logs');
    }
  }
}
