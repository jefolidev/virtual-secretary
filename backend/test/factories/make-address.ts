import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Address,
  AddressProps,
} from '@/domain/scheduling/enterprise/entities/address'
import { faker } from '@faker-js/faker'

export function makeAddress(
  override?: Partial<AddressProps>,
  id?: UniqueEntityId,
) {
  const address = Address.create(
    {
      addressLine1: faker.location.streetAddress(),
      addressLine2: faker.location.buildingNumber(),
      neighborhood: faker.lorem.text(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
      createdAt: new Date(),
      ...override,
    },
    id,
  )

  return address
}
