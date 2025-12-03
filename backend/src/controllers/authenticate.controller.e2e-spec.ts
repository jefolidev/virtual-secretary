import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = app.get<PrismaService>(PrismaService)

    await app.init()
  })

  afterAll(async () => {
    // Clean up resources, close the app, etc.
  })

  test('[POST] /sessions', async () => {
    await prisma.user.create({
      data: {
        name: 'Jeferson Franco de Oliveira',
        email: 'jeferson3@email.com.br',
        password: 'SenhaForte123',
        cpf: '60444032037',
        role: 'CLIENT',
        phone: '998877662',
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'jeferson3@email.com.br',
      password: 'SenhaForte123',
    })

    console.log(response.body)

    expect(response.statusCode).toBe(201)
  })
})
