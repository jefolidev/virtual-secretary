import { Env } from '@/infra/env/env'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'
import { Pool } from 'pg'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService<Env, true>) {
    const databaseURL = configService.get('DATABASE_URL')

    if (!databaseURL) {
      throw new Error('DATABASE_URL is not defined in environment variables')
    }

    const pool = new Pool({
      connectionString: databaseURL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    const adapter = new PrismaPg(pool)

    const nodeEnv =
      configService.get('NODE_ENV', { infer: true }) || 'development'

    super({
      adapter,

      log: nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    })
  }

  async onModuleInit() {
    await this.$connect()
    console.log('Connected to database successfully!')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
