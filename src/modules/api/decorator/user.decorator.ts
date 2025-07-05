import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(`🔍 [CurrentUserId] request.user:`, request?.user);
    console.log(`🔍 [CurrentUserId] request.user?.id:`, request?.user?.id);
    return request?.user?.id || null;
  },
);

export const CurrentUserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(`🔍 [CurrentUserRole] request.user:`, request?.user);
    console.log(`🔍 [CurrentUserRole] request.user?.role:`, request?.user?.role);
    return request?.user?.role || 'member';
  },
);

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
