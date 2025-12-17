import { ValueObject } from '@/core/entities/value-object'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { CancellationPolicy } from '../cancellation-policy'
import { ScheduleConfiguration } from '../schedule-configuration'

export interface UserProfessionalWithSettingsProps {
  name: string
  email: string
  phone: string
  sessionPrice: number
  organization: Organization | null
  scheduleConfiguration: ScheduleConfiguration
  cancellationPolicy: CancellationPolicy
  createdAt: Date
  updatedAt?: Date | null
}

export class UserProfessionalWithSettings extends ValueObject<UserProfessionalWithSettingsProps> {
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
    return this.createdAt
  }

  static create(props: UserProfessionalWithSettingsProps) {
    return new UserProfessionalWithSettings(props)
  }
}
