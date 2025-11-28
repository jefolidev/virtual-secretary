import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

function generateUniqueDatabaseURL(schemaId: string): string {
  if (!process.env.DATABASE_URL)
    throw new Error('Please provide a DATABASE_URL environment variable.')

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  process.env.DATABASE_URL = databaseURL

  execSync('yarn prisma migrate deploy')
  console.info('Test database created.')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()

  console.info('Test databases removed.')
})
