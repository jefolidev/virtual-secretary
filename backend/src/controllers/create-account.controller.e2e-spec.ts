import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

describe('Create account | E2E', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeEach(async () => {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined. Check your global setup.')
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    console.log(process.env.DATABASE_URL)

    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  test('[POST] /accounts', async () => {
    const databaseUrl = process.env.DATABASE_URL
    const url = new URL(databaseUrl!)
    const schema = url.searchParams.get('schema')

    if (schema) {
      await prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`)
    }

    const schemaCheck = await prisma.$queryRaw`SELECT current_schema()`
    console.log('[TEST DEBUG] Current Schema while test:', schemaCheck)

    const uniqueEmail = `johndoe${randomUUID()}@example.com`

    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'John Doe',
        email: uniqueEmail,
        password: 'SenhaForte123',
        cpf: '71264124368',
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
    console.log('[TEST DEBUG] Current Schema after test:', schemaCheck)

    console.log(response.body)
    expect(response.statusCode).toBe(201)

    const accountInDb = await prisma.user.findUnique({
      where: { email: uniqueEmail },
    })

    expect(accountInDb).not.toBeNull()
    expect(accountInDb?.name).toBe('John Doe')
  })
})
