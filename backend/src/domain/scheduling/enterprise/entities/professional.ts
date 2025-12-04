import { AggregateRoot } from '@/core/entities/aggregate'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface ProfessionalProps {
  organizationId?: UniqueEntityId
  notificationSettingsId: UniqueEntityId
  cancellationPolicyId: UniqueEntityId
  scheduleConfigurationId: UniqueEntityId
  name: string
  phone: string
  sessionPrice: number
  createdAt: Date
  updatedAt?: Date | null
}

export class Professional extends AggregateRoot<ProfessionalProps> {
  get organizationId() {
    return this.props.organizationId
  }

  get notificationSettingsId() {
    return this.props.notificationSettingsId
  }

  get scheduleConfigurationId() {
    return this.props.scheduleConfigurationId
  }

  set scheduleConfigurationId(scheduleConfigurationId: UniqueEntityId) {
    this.props.scheduleConfigurationId = scheduleConfigurationId
    this.touch()
  }

  get cancellationPolicyId() {
    return this.props.cancellationPolicyId
  }

  set cancellationPolicyId(cancellationPolicyId: UniqueEntityId) {
    this.props.cancellationPolicyId = cancellationPolicyId
    this.touch()
  }

  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  get phone() {
    return this.props.phone
  }

  set phone(phone: string) {
    this.props.phone = phone
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
        cancellationPolicyId:
          props.cancellationPolicyId ??
          new UniqueEntityId('cancellation-policy-id'),
        scheduleConfigurationId:
          props.scheduleConfigurationId ??
          new UniqueEntityId('schedule-configuration-id'),
        notificationSettingsId:
          props.notificationSettingsId ??
          new UniqueEntityId('notifcation-settings-id'),
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return professional
  }
}
