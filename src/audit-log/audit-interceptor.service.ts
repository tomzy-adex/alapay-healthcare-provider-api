import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { IAuditLog } from '../utils/types';
import { DynamicRepositoryService } from './dynamic-repository.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditLogService,
    private readonly dynamicRepositoryService: DynamicRepositoryService,
  ) {}

  async getEntityById(entityName: string, entityId: string) {
    const repository =
      await this.dynamicRepositoryService.getRepository(entityName);
    if (!repository) {
      throw new Error(`Repository for entity ${entityName} not found`);
    }
    return repository.findOne({ where: { id: entityId } });
  }

  /**
   * Map HTTP methods to actions.
   */
  async getActionFromMethod(method: string): Promise<string> {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'CREATE';
      case 'GET':
        return 'RETRIEVE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return null;
    }
  }

  /**
   * Intercepts requests to log actions for audit purposes.
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, params, body } = request;

    // Assume `entity` and `action` metadata are set using a decorator
    const entityName = Reflect.getMetadata('entityName', context.getHandler());
    const auditAction = await this.getActionFromMethod(method);

    console.log(
      `Retrieved metadata - Action: ${auditAction} ${method}, EntityName: ${entityName}`,
    );

    if (!entityName || !auditAction) {
      console.log('Missing metadata for AuditLog, skipping log creation');
      return next.handle();
    }

    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tap(async (response) => {
        // Fetch the `oldValue` from the database based on entity ID
        const entityId = params?.id;
        const oldValue = entityId
          ? await this.getEntityById(entityName, entityId)
          : null;

        if (body && 'password' in body) {
          delete body.password;
        }

        const auditLogPayload: IAuditLog = {
          action: auditAction,
          entityName,
          entityId,
          oldValue, // Previous state of the resource
          newValue: body || null, // New state from the request body
          userId: request.user?.id || null,
        };

        // Log the action
        await this.auditService.logAction(auditLogPayload);
      }),
    );
  }
}
