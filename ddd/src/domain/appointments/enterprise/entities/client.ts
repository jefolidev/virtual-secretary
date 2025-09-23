import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Appointment } from './appointment'

type PeriodPreferenceType = 'morning' | 'afternoon' | 'evening'

interface ClientProps {
  userId: UniqueEntityId
  name: string
  phone: string
  periodPreference?: PeriodPreferenceType[]
  extraPreferences?: string
  appointmentHistory: Appointment[]
  createdAt: Date
  updatedAt?: Date
}

export class Client extends Entity<ClientProps> {
  get userId() {
    return this.props.userId
  }

  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
    this.updatedAt = new Date()
  }

  get phone() {
    return this.props.phone
  }

  set phone(phone: string) {
    this.props.phone = phone
    this.updatedAt = new Date()
  }

  get periodPreference() {
    return this.props.periodPreference ?? []
  }

  set periodPreference(periodPreference: PeriodPreferenceType[]) {
    this.props.periodPreference = periodPreference
    this.updatedAt = new Date()
  }

  get extraPreferences() {
    return this.props.extraPreferences ?? 'No extra preferences'
  }

  set extraPreferences(extraPreferences: string) {
    this.props.extraPreferences = extraPreferences
    this.updatedAt = new Date()
  }

  get appointmentHistory() {
    return this.props.appointmentHistory
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  set updatedAt(updatedAt: Date) {
    this.props.updatedAt = updatedAt
  }

  static create(
    props: Optional<ClientProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const client = new Client(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    )

    return client
  }
}
