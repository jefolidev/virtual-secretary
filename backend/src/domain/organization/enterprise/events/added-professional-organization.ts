import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'

export class AddedProfessionalToOrganizationEvent implements DomainEvent {
  public ocurredAt: Date

  constructor(
    public readonly organizationId: UniqueEntityId,
    public readonly professionalId: UniqueEntityId,
    public readonly organizationName: string
  ) {
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.organizationId
  }
}
