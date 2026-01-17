import { EnvEvolution } from '@/infra/env/evolution/env-evolution'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class WhatsappService {
  public readonly baseUrl: string
  public readonly apiKey: string
  public readonly cacheRedisHost: string
  public readonly cacheRedisPort: number

  constructor(
    private readonly configService: ConfigService<EnvEvolution, true>,
  ) {
    this.baseUrl = this.configService.get<string>('DATABASE_CONNECTION_URI')
    this.apiKey = this.configService.get<string>('AUTHENTICATION_API_KEY')
    this.cacheRedisHost = this.configService.get<string>('CACHE_REDIS_URI')
  }
}
