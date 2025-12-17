import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { NotificationSettings } from './notification-settings'

export interface ProfessionalWithNotificationSettingsProps {
  professionalId: UniqueEntityId
  notificationSettings: NotificationSettings | null
  createdAt: Date
  updatedAt?: Date | null
}

export class ProfessionalWithNotificationSettings extends ValueObject<ProfessionalWithNotificationSettingsProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get notificationSettings() {
    return this.props.notificationSettings
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: ProfessionalWithNotificationSettingsProps) {
    return new ProfessionalWithNotificationSettings(props)
  }
}
