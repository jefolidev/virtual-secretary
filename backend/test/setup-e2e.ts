import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

// Get the base connection URL (without schema parameter)
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

// This client is used ONLY for dropping the schema in afterAll
const prisma = new PrismaClient({ adapter })

// The unique ID for the test schema
const schemaId = randomUUID()

/**
 * Generates a unique database URL with a specific schema ID.
 */
function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(databaseUrl as string)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

// Runs before any test
beforeAll(async () => {
  // 1. Generate the unique test database URL
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  // 2. CRUCIAL: Set the environment variable for the ENTIRE test run.
  // The E2E test file will read this value in its beforeEach block.
  process.env.DATABASE_URL = databaseURL

  // 3. Deploy the migrations to the new, unique schema
  console.log(`Deploying migrations to schema: ${schemaId}`)
  execSync('prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: databaseURL },
  })
})

// Runs after all tests have finished
// afterAll(async () => {
//   // 4. Clean up by dropping the schema
//   console.log(`Dropping schema: ${schemaId}`)
//   await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
//   await prisma.$disconnect()
// })
