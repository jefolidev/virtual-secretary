import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { Organization } from '@src/domain/organization/enterprise/entities/organization'
import type { OrganizationRepository } from './../../src/domain/organization/application/repositories/organization.repository'

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public items: Organization[] = []

  async create(organization: Organization): Promise<void> {
    await this.items.push(organization)
  }

  async findById(id: UniqueEntityId): Promise<Organization | null> {
    const organization = await this.items.find((org) => org.id.equals(id))

    return organization ?? null
  }

  async findMany(): Promise<Organization[] | null> {
    return (await this.items) ?? []
  }

  async findByOwnerId(id: UniqueEntityId): Promise<Organization | null> {
    const organization = await this.items.find((org) => org.ownerId.equals(id))

    return organization ?? null
  }

  async save(organization: Organization): Promise<void> {
    const itemIndex = await this.items.findIndex((item) =>
      item.id.equals(organization.id)
    )

    this.items[itemIndex] = organization
  }
}
