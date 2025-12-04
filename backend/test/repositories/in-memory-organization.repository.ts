import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import type { Organization } from '@/domain/organization/enterprise/entities/organization'
import type { OrganizationRepository } from './../../src/domain/organization/application/repositories/organization.repository'

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public items: Organization[] = []

  async create(organization: Organization): Promise<void> {
    await this.items.push(organization)

    DomainEvents.dispatchEventsForAggregate(organization.id)
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await this.items.find((org) =>
      org.id.equals(new UniqueEntityId(id))
    )

    if (!organization) {
      return null
    }

    return organization
  }

  async findMany(): Promise<Organization[] | null> {
    return (await this.items) ?? []
  }

  async findByOwnerId(id: string): Promise<Organization | null> {
    const organization = await this.items.find((org) =>
      org.ownerId.equals(new UniqueEntityId(id))
    )

    return organization ?? null
  }

  async save(organization: Organization): Promise<void> {
    const itemIndex = await this.items.findIndex((item) =>
      item.id.equals(organization.id)
    )

    this.items[itemIndex] = organization
    DomainEvents.dispatchEventsForAggregate(organization.id)
  }
}
