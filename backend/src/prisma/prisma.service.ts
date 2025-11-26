import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/generated/client"
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {

    const databaseURL =  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/virtual-secretary-db?schema=public"
    const pool = new Pool({
      connectionString: databaseURL,
    })

    const adapter = new PrismaPg(pool)

    super({adapter, log: ["error", "warn"], errorFormat: "pretty"})
  }

  async onModuleInit() {
    await this.$connect()
    console.log('Connected to database successfully!')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}