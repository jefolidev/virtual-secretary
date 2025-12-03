import { AppModule } from '@/app.module'
import { envSchema } from '@/env'
import { PrismaService } from '@/prisma/prisma.service' // <-- Make sure this import is present
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import request from 'supertest'

// Note: This needs to be imported if it's not global, otherwise the E2E tests won't know the type.
// You might need to adjust the path based on your project structure.

describe('Create account | E2E', () => {
  let app: INestApplication
  let prisma: PrismaService // The injected service instance

  beforeEach(async () => {
    // process.env.DATABASE_URL is correctly set by the global-setup file
    // to include the unique schema ID.
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined. Check your global setup.')
    }

    // 1. Configure the database connection for the unique test schema
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)

    // We create the actual PrismaClient configured to use the test schema
    const configuredClient = new PrismaClient({ adapter })

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          validate: (env) => envSchema.parse(env),
        }),
        AppModule,
      ],
    })
      // 2. CORRECT OVERRIDE: Override the PrismaService class token
      // with the manually created and configured client instance.
      .overrideProvider(PrismaService)
      .useValue(configuredClient)
      .compile()

    // 3. Get the instance (which is now our configured client)
    // We cast it to PrismaService type to satisfy the application context.
    prisma = moduleRef.get<PrismaService>(PrismaService)

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
    // The database connection cleanup (dropping the schema) happens
    // in the global-teardown (or afterAll in the setup file).
  })

  test('[POST] /accounts', async () => {
    const uniqueEmail = `johndoe${randomUUID()}@example.com`

    // Generate a unique, 11-digit string for the CPF to avoid 409 Conflicts.
    const uniqueCpf = Math.floor(Math.random() * 100000000000)
      .toString()
      .padStart(11, '0')

    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'John Doe',
        email: uniqueEmail,
        password: 'SenhaForte123',
        cpf: '71264124368', // <--- Using the unique CPF here
        role: 'CLIENT',
        phone: '999999999',
        address: {
          addressLine1: 'Rua Exemplo, 123',
          addressLine2: 'Apto 101',
          neighborhood: 'Bairro Central',
          city: 'Fortaleza',
          state: 'CE',
          postalCode: '60000000',
          country: 'Brasil',
        },
      })

    expect(response.statusCode).toBe(201)

    // Optional: Verify the account was created in the test schema
    const accountInDb = await prisma.user.findUnique({
      where: { email: uniqueEmail },
    })

    expect(accountInDb).not.toBeNull()
    expect(accountInDb?.name).toBe('John Doe')
  })
})
