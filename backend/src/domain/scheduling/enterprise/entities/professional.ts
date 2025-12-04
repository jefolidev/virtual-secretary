import { AggregateRoot } from '@/core/entities/aggregate'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { NotificationSettings } from './value-objects/notification-settings'

export interface ProfessionalProps {
  organizationId?: UniqueEntityId
  notificationSettings: NotificationSettings
  cancellationPolicyId: UniqueEntityId
  scheduleConfigurationId: UniqueEntityId
  name: string
  phone: string
  sessionPrice: number
  officeAddress: string
  createdAt: Date
  updatedAt?: Date
}

export class Professional extends AggregateRoot<ProfessionalProps> {
  get organizationId() {
    return this.props.organizationId
  }

  get notificationSettings() {
    return this.props.notificationSettings
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

  get officeAddress() {
    return this.props.officeAddress
  }

  set officeAddress(officeAddress: string) {
    this.props.officeAddress = officeAddress
    this.touch()
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
      'createdAt' | 'cancellationPolicyId' | 'scheduleConfigurationId'
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
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return professional
  }
}
