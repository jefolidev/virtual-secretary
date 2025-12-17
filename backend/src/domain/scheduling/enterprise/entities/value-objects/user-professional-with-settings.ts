import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { CancellationPolicy } from '../cancellation-policy'
import { ScheduleConfiguration } from '../schedule-configuration'

export interface UserProfessionalWithSettingsProps {
  id: UniqueEntityId
  name: string
  email: string
  phone: string
  sessionPrice: number
  organization: Organization | null
  scheduleConfiguration: ScheduleConfiguration | undefined
  cancellationPolicy: CancellationPolicy | undefined
  createdAt: Date
  updatedAt?: Date | null
}

export class UserProfessionalWithSettings extends ValueObject<UserProfessionalWithSettingsProps> {
  get id() {
    return this.props.id
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get sessionPrice() {
    return this.props.sessionPrice
  }

  get organization() {
    return this.props.organization
  }

  get scheduleConfiguration() {
    return this.props.scheduleConfiguration
  }

  get cancellationPolicy() {
    return this.props.cancellationPolicy
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: UserProfessionalWithSettingsProps) {
    return new UserProfessionalWithSettings(props)
  }
}
