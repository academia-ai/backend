import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from './types/user.type';

@Injectable()
export class UsersService {
  getProfile(user: AuthUser) {
    try {
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return { user };
    } catch (error) {
      console.error('fetching user profile:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch user profile ');
    }
  }
}
