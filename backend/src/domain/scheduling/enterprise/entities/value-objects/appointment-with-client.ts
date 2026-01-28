import { ValueObject } from '@/core/entities/value-object'
import { Notification } from '@/domain/notifications/enterprise/entities/notification'
import { Address } from '../address'
import { Appointment } from '../appointment'
import { PeriodPreferenceType } from '../client'

export interface AppointmentWithClientProps {
  appointment: Appointment
  client: {
    extraPreference: string | null
    periodPreference: PeriodPreferenceType[] | null
  }

  address: Address
  notification: Notification[]
  name: string
  whatsappNumber: string
  email: string
  cpf: string
  gender: 'MALE' | 'FEMALE'
}

export class AppointmentWithClient extends ValueObject<AppointmentWithClientProps> {
  get appointment(): Appointment {
    return this.props.appointment
  }

  get address(): Address {
    return this.props.address
  }

  get notification(): Notification[] {
    return this.props.notification || []
  }

  get extraPreference(): string | null {
    return this.props.client.extraPreference
  }

  get periodPreference(): PeriodPreferenceType[] | null {
    return this.props.client.periodPreference
  }

  get name(): string {
    return this.props.name
  }

  get whatsappNumber(): string {
    return this.props.whatsappNumber
  }

  get email(): string {
    return this.props.email
  }

  get cpf(): string {
    return this.props.cpf
  }

  get gender(): 'MALE' | 'FEMALE' {
    return this.props.gender
  }

  static create(props: AppointmentWithClientProps) {
    return new AppointmentWithClient(props)
  }
}
