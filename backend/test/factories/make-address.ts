import { AddressProps } from '@/domain/scheduling/enterprise/entities/user'
import { faker } from '@faker-js/faker'

export function makeAddress(override?: Partial<AddressProps>): AddressProps {
  const address: AddressProps = {
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.location.buildingNumber(),
    neighborhood: faker.lorem.text(),
    city: faker.location.city(),
    state: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: faker.location.country(),
    ...override,
  }

  return address
}
