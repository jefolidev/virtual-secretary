import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import dayjs from 'dayjs'

export type AppointmentModalityType = 'IN_PERSON' | 'ONLINE'
export type AppointmentStatusType =
  | 'SCHEDULED'
  | 'CANCELED'
  | 'NO_SHOW'
  | 'COMPLETED'

export interface AppointmentProps {
  clientId: UniqueEntityId
  professionalId: UniqueEntityId
  paymentId?: UniqueEntityId
  startDateTime: Date
  endDateTime: Date
  modality: AppointmentModalityType
  status: AppointmentStatusType
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
    this.touch()
  }

  get endDateTime() {
    return this.props.endDateTime
  }

  set endDateTime(endDateTime: Date) {
    this.props.endDateTime = endDateTime
    this.touch()
  }

  get modality() {
    return this.props.modality
  }

  set modality(modality: AppointmentModalityType) {
    this.props.modality = modality
    this.touch()
  }

  get status() {
    return this.props.status
  }

  set status(status: AppointmentStatusType) {
    this.props.status = status
    this.touch()
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
    this.touch()
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
    this.touch()
  }

  setRescheduleDateTime(rescheduleDateTime: { start: Date; end: Date }) {
    this.props.rescheduleDateTime = rescheduleDateTime
    this.touch()
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

  get hasPayment(): boolean {
    return !!this.props.paymentId
  }

  static create(
    props: Optional<AppointmentProps, 'createdAt' | 'isRescheduled' | 'status'>,
    id?: UniqueEntityId
  ) {
    const appointment = new Appointment(
      {
        ...props,
        status: 'SCHEDULED',
        createdAt: props.createdAt ?? new Date(),
        isRescheduled: props.isRescheduled ?? false,
      },
      id
    )

    return appointment
  }
}
