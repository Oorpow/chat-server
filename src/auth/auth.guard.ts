import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { HTTPERROR } from 'src/common/enum/http-error.enum';
import { AUTH_GUARD_KEY } from 'src/common/enum/metadata-key';

interface JwtUserData {
  userId: number;
  username: string;
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const requiredLogin = this.reflector.getAllAndOverride(AUTH_GUARD_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requiredLogin) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException(HTTPERROR.NO_LOGIN);
    }

    try {
      const token = authorization.split('Bearer ')[1];
      const data = this.jwtService.verify<JwtUserData>(token);
      request.user = {
        userId: data.userId,
        username: data.username,
      };
      response.header(
        'token',
        this.jwtService.sign({
          userId: data.userId,
          username: data.username,
        }),
      );
      return true;
    } catch (error) {
      throw new UnauthorizedException(HTTPERROR.TOKEN_EXPIRED);
    }
  }
}
