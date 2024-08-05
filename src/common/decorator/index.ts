import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { AUTH_GUARD_KEY } from '../enum/metadata-key';
import { Request } from 'express';

// 判断用户是否登录的装饰器
export const RequiredLogin = () => SetMetadata(AUTH_GUARD_KEY, true);

/**
 * 获取用户信息的装饰器
 * @returns
 */
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  },
);
