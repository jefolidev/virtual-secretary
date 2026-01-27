import { Env } from '@/infra/env/env'
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public readonly redisClient: Redis
  private readonly logger = new Logger(RedisService.name)

  constructor(private readonly redisConfiguration: ConfigService<Env, true>) {
    this.redisClient = new Redis({
      host: this.redisConfiguration.get('REDIS_HOST'),
      port: this.redisConfiguration.get('REDIS_PORT'),
      password: this.redisConfiguration.get('REDIS_PASSWORD'),
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    this.redisClient.on('error', (err) => {
      console.error('Redis error:', err)
    })
  }

  async onModuleInit() {
    await this.redisClient.connect()
    this.logger.log('Connected to Redis successfully!')
  }
  async onModuleDestroy() {
    await this.redisClient.quit()
    this.logger.log('Disconnected from Redis successfully!')
  }
}
