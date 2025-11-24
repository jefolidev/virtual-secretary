import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import {
  Organization,
  type OrganizationProps,
} from '@src/domain/organization/enterprise/entities/organization'

export function makeOrganization(
  override: Partial<OrganizationProps> = {},
  id?: UniqueEntityId
) {
  const organization = Organization.create(
    {
      name: `${faker.person.firstName}'s office`,
      ownerId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return organization
}
