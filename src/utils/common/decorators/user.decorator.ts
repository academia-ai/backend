import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from 'src/users/types/user.type';

export const UserDecorator = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const payload = request['user'] as AuthUser;

    const user: AuthUser = {
      _id: payload._id ?? '',
      fullName: payload.fullName ?? '',
      email: payload.email ?? '',
      role: payload.role ?? ('' as 'USER' | 'ADMIN'),
      isVerified: payload.isVerified ?? false,
    };

    if (data) {
      return user[data];
    }

    return user;
  },
);
