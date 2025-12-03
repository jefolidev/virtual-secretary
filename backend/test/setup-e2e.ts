import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable not set in .env or environment.'
  )
}

const pool = new Pool({
  connectionString: databaseUrl,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

const schemaId = randomUUID()

function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(databaseUrl as string)
  url.searchParams.set('schema', schemaId)
  url.searchParams.set('options', `-c search_path=${schemaId}`)
  return url.toString()
}

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  process.env.DATABASE_URL = databaseURL

  console.log(`Deploying migrations to schema: ${schemaId}`)
  execSync('bunx prisma migrate deploy ')
})

// afterAll(async () => {
//   // 4. Clean up by dropping the schema
//   console.log(`Dropping schema: ${schemaId}`)
//   await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
//   await prisma.$disconnect()
// })
