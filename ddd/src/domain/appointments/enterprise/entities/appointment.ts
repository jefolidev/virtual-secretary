import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import dayjs from 'dayjs'

type AppointmentModalityType = 'IN_PERSON' | 'ONLINE'
type AppointmentStatusType = 'SCHEDULED' | 'CANCELED' | 'NO_SHOW' | 'COMPLETED'

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
  isRescheduled: boolean
  rescheduleDateTime?: { start: Date; end: Date }
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

  get isRescheduled() {
    return this.props.isRescheduled
  }

  set isRescheduled(isRescheduled: boolean) {
    if (this.props.status !== 'SCHEDULED') {
      throw new Error('the schedule must still be as scheduled.')
    }

    this.props.isRescheduled = isRescheduled
    this.updatedAt = new Date()
  }

  get rescheduleDateTime() {
    return this.props.rescheduleDateTime
  }

  setAsRescheduled(rescheduleDateTime: { start: Date; end: Date }) {
    if (!this.props.isRescheduled) {
      throw new Error('Appointment must be marked as rescheduled first')
    }

    const start = dayjs(rescheduleDateTime.start)
    const end = dayjs(rescheduleDateTime.end)

    if (!start.isValid() || !end.isValid()) {
      throw new Error('Invalid reschedule date')
    }

    if (start.isAfter(end)) {
      throw new Error('Reschedule start must be before end')
    }

    this.props.rescheduleDateTime = rescheduleDateTime
    this.updatedAt = new Date()
  }

  setRescheduleDateTime(rescheduleDateTime: { start: Date; end: Date }) {
    this.props.rescheduleDateTime = rescheduleDateTime
    this.updatedAt = new Date()
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
