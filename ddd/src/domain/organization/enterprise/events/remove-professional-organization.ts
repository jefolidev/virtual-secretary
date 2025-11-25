import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { DomainEvent } from '@src/core/events/domain-event'

export class RemovedProfessionalFromOrganizationEvent implements DomainEvent {
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
