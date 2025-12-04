import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Appointment } from './appointment'

export type PeriodPreferenceType = 'MORNING' | 'AFTERNOON' | 'EVENING'

export interface ClientProps {
  userId: UniqueEntityId
  name: string
  phone: string
  periodPreference?: PeriodPreferenceType[] | null
  extraPreferences?: string | null
  appointmentHistory: Appointment[]
  createdAt: Date
  updatedAt?: Date | null
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
    this.touch()
  }

  get phone() {
    return this.props.phone
  }

  set phone(phone: string) {
    this.props.phone = phone
    this.touch()
  }

  get periodPreference() {
    return this.props.periodPreference ?? []
  }

  set periodPreference(periodPreference: PeriodPreferenceType[]) {
    this.props.periodPreference = periodPreference
    this.touch()
  }

  get extraPreferences() {
    return this.props.extraPreferences ?? 'No extra preferences'
  }

  set extraPreferences(extraPreferences: string) {
    this.props.extraPreferences = extraPreferences
    this.touch()
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

  private touch() {
    this.props.updatedAt = new Date()
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
