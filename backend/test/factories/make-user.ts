import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/scheduling/enterprise/entities/user'
import { faker } from '@faker-js/faker'
import { makeAddress } from './make-address'

export function makeClientUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId,
) {
  const address = makeAddress()

  return User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      addressId: address.id,
      cpf: '07609254371',
      gender: faker.helpers.arrayElement(['MALE', 'FEMALE'] as const),
      birthDate: faker.date.past({ years: 50 }),
      role: 'CLIENT',
      whatsappNumber: faker.phone.number(),
      clientId: new UniqueEntityId(),
      professionalId: undefined,
      ...override,
    },
    id,
  )
}

export function makeProfessionalUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId,
) {
  const address = makeAddress()

  return User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      addressId: address.id,
      cpf: '07609254371',
      gender: faker.helpers.arrayElement(['MALE', 'FEMALE'] as const),
      birthDate: faker.date.past({ years: 50 }),
      role: 'PROFESSIONAL',
      whatsappNumber: faker.phone.number(),
      clientId: undefined,
      professionalId: new UniqueEntityId(),
      ...override,
    },
    id,
  )
}
