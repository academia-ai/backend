import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in environment variables');
    }

    // Initialize Redis client
    this.redis = new Redis(redisUrl);

    // Log when connected
    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    // Handle errors
    this.redis.on('error', (err: Error) => {
      this.logger.error('Redis error', err);
    });
  }

  // ---------------- SET ----------------
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);

      if (ttl) {
        await this.redis.set(key, data, 'EX', ttl); // EX = expire in seconds
      } else {
        await this.redis.set(key, data);
      }
    } catch (error: any) {
      throw new Error(`Error saving data to Redis: ${error.message}`);
    }
  }

  // ---------------- GET ----------------
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error: any) {
      throw new Error(`Error getting cache: ${error.message}`);
    }
  }

  // ---------------- DELETE ----------------
  async destroy(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error: any) {
      throw new Error(`Error deleting cache: ${error.message}`);
    }
  }

  // ---------------- CLEANUP ----------------
  async onModuleDestroy() {
    this.logger.log('Closing Redis connection');
    await this.redis.quit();
  }
}
