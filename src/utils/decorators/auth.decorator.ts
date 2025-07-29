import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Defines GetAuthData decorator
 *
 * @param factory
 */
export const GetAuthData = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.authData;
});
