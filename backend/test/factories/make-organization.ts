import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Organization,
  type OrganizationProps,
} from '@/domain/organization/enterprise/entities/organization'
import { faker } from '@faker-js/faker'

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
