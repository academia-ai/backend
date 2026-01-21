import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from './types/user.type';
import { RedisService } from 'src/lib/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(private readonly redis: RedisService) {}

  async getProfile(user: AuthUser) {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const cacheKey = `user${user._id}`;
    try {
      const cached = await this.redis.get<AuthUser>(cacheKey);

      if (cached) {
        return { user: cached, cached: true };
      }

      const userProfile = { ...user };

      await this.redis.set(cacheKey, userProfile, 60);

      return { user: userProfile, cached: false };
    } catch (error) {
      console.error('fetching user profile:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch user profile ');
    }
  }
}
