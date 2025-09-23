import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

type AppointmentModalityType = 'IN_PERSON' | 'ONLINE'
type AppointmentStatusType =
  | 'SCHEDULED'
  | 'CANCELED'
  | 'CONFIRMED'
  | 'NO_SHOW'
  | 'COMPLETED'

interface AppointmentProps {
  clientId: UniqueEntityId
  professionalId: UniqueEntityId
  paymentId?: UniqueEntityId
  startDateTime: Date
  endDateTime: Date
  modality: AppointmentModalityType
  status: AppointmentStatusType
  extraPreferences?: string
  googleMeetLink?: string
  createdAt: Date
  updatedAt?: Date
}

export class Appointment extends Entity<AppointmentProps> {
  get clientId() {
    return this.props.clientId
  }

  get professionalId() {
    return this.props.professionalId
  }

  get paymentId() {
    return this.props.paymentId
  }

  get startDateTime() {
    return this.props.startDateTime
  }

  set startDateTime(startDateTime: Date) {
    this.props.startDateTime = startDateTime
    this.updatedAt = new Date()
  }

  get endDateTime() {
    return this.props.endDateTime
  }

  set endDateTime(endDateTime: Date) {
    this.props.endDateTime = endDateTime
    this.updatedAt = new Date()
  }

  get modality() {
    return this.props.modality
  }

  set modality(modality: AppointmentModalityType) {
    this.props.modality = modality
    this.updatedAt = new Date()
  }

  get status() {
    return this.props.status
  }

  set status(status: AppointmentStatusType) {
    this.props.status = status
    this.updatedAt = new Date()
  }

  get extraPreferences() {
    return this.props.extraPreferences ?? 'No extra preferences'
  }

  set extraPreferences(extraPreferences: string) {
    this.props.extraPreferences = extraPreferences
  }

  get googleMeetLink() {
    return this.props.googleMeetLink ?? 'No google meet link'
  }

  set googleMeetLink(googleMeetLink: string) {
    this.props.googleMeetLink = googleMeetLink
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? new Date()
  }

  set updatedAt(updatedAt: Date) {
    this.props.updatedAt = updatedAt
  }

  get hasPayment(): boolean {
    return !!this.props.paymentId
  }

  static create(
    props: Optional<AppointmentProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const appointment = new Appointment(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    )

    return appointment
  }
}
