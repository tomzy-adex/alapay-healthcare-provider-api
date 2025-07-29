import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { NotificationService } from './notification.service';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';
import { AuthData } from 'src/utils/auth.strategy';
import { GetAuthData } from 'src/utils/decorators/auth.decorator';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { QueryDto } from 'src/config/dto/query.dto';

@ApiBearerAuth('JWT')
@ApiTags('Notifications')
@UseInterceptors(AuditInterceptor)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AdminGuard)
  @Get('notifications')
  @AuditLog('Post', 'Notification')
  async submitClaim(
    @Query() query: QueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.notificationService.getNotifications(authData, query);
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  @AuditLog('Get', 'Notification')
  async getNotificationById(
    @Param('id') id: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.notificationService.getNotificationById(id, authData);
  }
}
