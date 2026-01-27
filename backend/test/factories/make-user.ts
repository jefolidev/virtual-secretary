import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/scheduling/enterprise/entities/user'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'
import { faker } from '@faker-js/faker'
import { PrismaService } from '../../src/infra/database/prisma/prisma.service'
import { makeAddress } from './make-address'

export class UserFactory {
  constructor(private prisma: PrismaService) {}

  static async makeClientUser(
    override: Partial<UserProps> = {},
    id?: UniqueEntityId,
  ) {
    const password = faker.internet.password({ length: 12 })
    const address = makeAddress()

    const user = User.create(
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        addressId: address.id,
        cpf: '07609254371',
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE'] as const),
        birthDate: faker.date.past({ years: 50 }),
        role: 'CLIENT',
        whatsappNumber: faker.phone.number(),
        clientId: new UniqueEntityId('client-id'),
        professionalId: undefined,
        ...override,
      },
      id,
    )

    return user
  }

  static async makeProfessionalUser(
    override: Partial<UserProps> = {},
    id?: UniqueEntityId,
  ) {
    const password = faker.internet.password({ length: 12 })
    const address = makeAddress()

    const user = User.create(
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        addressId: address.id,
        cpf: '07609254371',
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE'] as const),
        birthDate: faker.date.past({ years: 50 }),
        role: 'PROFESSIONAL',
        whatsappNumber: faker.phone.number(),
        clientId: undefined,
        professionalId: new UniqueEntityId('professional-id'),
        ...override,
      },
      id,
    )

    return user
  }

  async makePrismaStudent(data: Partial<UserProps> = {}): Promise<User> {
    const user = await UserFactory.makeClientUser(data)

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    })

    return user
  }
}
