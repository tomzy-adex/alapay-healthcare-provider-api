import { SetMetadata } from '@nestjs/common';

export const AuditLog = (action: string, entityName: string) => {
  console.log(
    `Setting metadata for action: ${action}, entityName: ${entityName}`,
  );
  return (target: object, key?: any, descriptor?: any) => {
    SetMetadata('auditAction', action)(target, key, descriptor);
    SetMetadata('entityName', entityName)(target, key, descriptor);
  };
};
