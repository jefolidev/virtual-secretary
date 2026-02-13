import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { Appointment } from '../appointment'
import { Client } from '../client'
import { User } from '../user'
import { WhatsappContact } from '../whatsapp-contact'

export interface UserClientWhatsappAppointmentsProps {
  id?: UniqueEntityId | null
  user?: User | null
  client?: Client | null
  whatsappContact?: WhatsappContact | null
  appointments?: Appointment[]
  isRegistered?: boolean
  createdAt?: Date
  updatedAt?: Date | null
}

export class UserClientWhatsappAppointments extends ValueObject<UserClientWhatsappAppointmentsProps> {
  get id(): UniqueEntityId | null {
    return this.props.id ?? null
  }

  get user() {
    return this.props.user ?? null
  }

  get client() {
    return this.props.client ?? null
  }

  get whatsappContact() {
    return this.props.whatsappContact ?? null
  }

  get appointments() {
    return this.props.appointments ?? []
  }

  get isRegistered() {
    if (this.props.isRegistered) return this.props.isRegistered

    const contactUserId = this.props.whatsappContact?.userId
    return !!(this.props.user || contactUserId)
  }

  get createdAt() {
    return this.props.createdAt ?? new Date()
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.createdAt
  }

  static create(props: UserClientWhatsappAppointmentsProps) {
    const normalized: UserClientWhatsappAppointmentsProps = {
      ...props,
      appointments: props.appointments ?? [],
      createdAt: props.createdAt ?? new Date(),
      isRegistered: props.isRegistered
        ? props.isRegistered
        : !!(props.user || (props.whatsappContact as any)?.userId),
    }

    return new UserClientWhatsappAppointments(normalized)
  }
}
