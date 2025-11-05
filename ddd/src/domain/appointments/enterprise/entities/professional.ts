import { AggregateRoot } from '@src/core/entities/aggregate'
import type { Optional } from '@src/core/entities/types/optional'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { NotificationSettings } from './value-objects/notification-settings'

export interface ProfessionalProps {
  userId: UniqueEntityId
  notificationSettings: NotificationSettings
  cancellationPolicyId: UniqueEntityId
  scheduleConfigurationId: UniqueEntityId
  name: string
  phone: string
  officeAddress: string
  createdAt: Date
  updatedAt?: Date
}

export class Professional extends AggregateRoot<ProfessionalProps> {
  get userId() {
    return this.props.userId
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
    props: Optional<ProfessionalProps, 'createdAt' | 'cancellationPolicyId'>,
    id?: UniqueEntityId
  ) {
    const professional = new Professional(
      {
        ...props,
        cancellationPolicyId:
          props.cancellationPolicyId ??
          new UniqueEntityId('cancellation-policy-id'),
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return professional
  }
}
