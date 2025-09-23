import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { NotificationSettings } from './value-objects/notification-settings'

interface ProfessionalProps {
  userId: UniqueEntityId
  notificationSettingsId: UniqueEntityId
  cancellationPolicyId: UniqueEntityId
  name: string
  phone: string
  officeAddress: string
  notificationSettings: NotificationSettings
  createdAt: Date
  updatedAt?: Date
}

export class Professional extends Entity<ProfessionalProps> {
  get userId() {
    return this.props.userId
  }

  get notificationSettingsId() {
    return this.props.notificationSettingsId
  }

  get cancellationPolicyId() {
    return this.props.cancellationPolicyId
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

  get notificationSettings() {
    return this.props.notificationSettings
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
    props: Optional<ProfessionalProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const professional = new Professional(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    )

    return professional
  }
}
