import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

interface JwtPayload {
  userId: string;
  fullName: string;
  email: string;
  role?: string;
  isVerified: boolean;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const token = this.requestTokenFromHeader(request);
      // console.log('Token:', token);

      if (!token) {
        throw new NotFoundException('Token not provided');
      }
      const payload: JwtPayload = await this.jwt.verifyAsync<JwtPayload>(
        token,
        {
          // secret: process.env.REFRESH_JWT_SEC,
          secret: process.env.ACCESS_JWT_SEC,
        },
      );
      // console.log('Payload:', payload);
      const user = await this.userModel
        .findById(payload.userId)
        .select('-password');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      // console.log('Authenticated User:', user);
      request['user'] = user;
    } catch (error: unknown) {
      const err = error as Error;
      throw new UnauthorizedException({
        message: err.message || 'Invalid token',
        statusCode: 401,
      });
    }

    return true;
  }

  private requestTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      return undefined;
    }

    return token;
  }
}
