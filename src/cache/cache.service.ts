import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { decode } from 'jsonwebtoken';

@Injectable()
export class CacheService implements OnModuleInit {
  constructor(
    @Inject('IOREDIS_INSTANCE')
    private readonly ioredis: Redis,
  ) {}

  async onModuleInit() {
    try {
      await this.ioredis.ping();
      console.log('Redis connection successful');
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }

  async set<T>(key: string, data: T, ttl = 3600) {
    await this.ioredis.set(key, JSON.stringify(data), 'EX', ttl);
  }

  /**
   * Get data from the cache.
   *
   * @param   {string} key
   *
   * @return  {Promise<T>}
   */
  async get<T>(key: string): Promise<T | undefined> {
    const data = await this.ioredis.get(key);
    // let decoded: T;

    if (!data) return undefined;

    try {
      return JSON.parse(data);
    } catch {
      return undefined;
    }
  }

  async remove(key: string) {
    return await this.ioredis.del(key);
  }

  async clear() {
    return this.ioredis.flushdb();
  }

  async createStream(key: string, payload: object) {
    try {
      const args = [];
      for (const [key, value] of Object.entries(payload)) {
        args.push(key, value);
      }
      return this.ioredis.xadd(key, '*', ...args);
    } catch (error) {
      throw error;
    }
  }

  async addToBlacklist(token: string, expiresIn: number) {
    const decoded = decode(token);

    if (!decoded || typeof decoded === 'string') {
      throw new BadRequestException('Invalid token');
    }

    const exp = decoded.exp; // `exp` is only available on `JwtPayload`
    if (!exp) {
      throw new BadRequestException('Token does not have an expiration time');
    }

    const ttl = expiresIn || exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) {
      throw new BadRequestException('Token has already expired');
    }
    await this.set(`blacklist:${token}`, 'true', ttl);
  }

  async isBlacklisted(token: string) {
    const result = await this.get(`blacklist:${token}`);

    return Boolean(result);
  }
}
