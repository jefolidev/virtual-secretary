import { AggregateRoot } from '@/core/entities/aggregate'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface ProfessionalProps {
  userId?: UniqueEntityId
  organizationId?: UniqueEntityId
  notificationSettingsId?: UniqueEntityId
  cancellationPolicyId?: UniqueEntityId
  scheduleConfigurationId?: UniqueEntityId
  sessionPrice: number
  createdAt: Date
  updatedAt?: Date | null
}

export class Professional extends AggregateRoot<ProfessionalProps> {
  get organizationId() {
    return this.props.organizationId
  }

  set organizationId(organizationId: UniqueEntityId | undefined) {
    this.props.organizationId = organizationId || undefined
    this.touch()
  }

  get userId() {
    return this.props.userId
  }

  get notificationSettingsId() {
    return this.props.notificationSettingsId
  }

  get scheduleConfigurationId() {
    return this.props.scheduleConfigurationId
  }

  set scheduleConfigurationId(
    scheduleConfigurationId: UniqueEntityId | undefined
  ) {
    this.props.scheduleConfigurationId = scheduleConfigurationId
    this.touch()
  }

  get cancellationPolicyId() {
    return this.props.cancellationPolicyId
  }

  set cancellationPolicyId(cancellationPolicyId: UniqueEntityId | undefined) {
    this.props.cancellationPolicyId = cancellationPolicyId
    this.touch()
  }

  get sessionPrice() {
    return this.props.sessionPrice
  }

  set sessionPrice(sessionPrice: number) {
    this.props.sessionPrice = sessionPrice
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      ProfessionalProps,
      | 'createdAt'
      | 'cancellationPolicyId'
      | 'scheduleConfigurationId'
      | 'notificationSettingsId'
    >,
    id?: UniqueEntityId
  ) {
    const professional = new Professional(
      {
        ...props,
        cancellationPolicyId: props.cancellationPolicyId ?? undefined,
        scheduleConfigurationId: props.scheduleConfigurationId ?? undefined,
        notificationSettingsId: props.notificationSettingsId ?? undefined,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return professional
  }
}
