import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';

@ApiTags('Role')
@UseInterceptors(AuditInterceptor)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('roles')
  @AuditLog('Get', 'Role')
  async getRoles() {
    return await this.roleService.getRoles();
  }

  @Get()
  @AuditLog('Get', 'Role')
  async getRoleById(@Query('roleId') roleId: string) {
    return await this.roleService.getRoleById(roleId);
  }
}
