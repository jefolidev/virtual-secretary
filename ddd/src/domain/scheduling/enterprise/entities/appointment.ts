import { AggregateRoot } from '@src/core/entities/aggregate'
import type { Optional } from '@src/core/entities/types/optional'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { CanceledAppointmentEvent } from '../events/canceled-appointment'
import { ConfirmedAppointmentEvent } from '../events/confirmed-appointment'
import { ScheduledAppointmentEvent } from '../events/scheduled-appointment-event'

export type AppointmentModalityType = 'IN_PERSON' | 'ONLINE'
export type AppointmentStatusType =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW'
  | 'IN_PROGRESS'
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
  rescheduleDateTime?: { start: Date; end: Date }
  isPaid: boolean
  createdAt: Date
  updatedAt?: Date
}

export class Appointment extends AggregateRoot<AppointmentProps> {
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
    this.touch()
  }

  get rescheduleDateTime() {
    return this.props.rescheduleDateTime
  }

  get isPaid() {
    return this.props.isPaid
  }

  public linkPayment(paymentId: UniqueEntityId): void {
    if (this.props.paymentId) {
      throw new Error('Schedule already has a payment id.')
    }
    this.props.paymentId = paymentId
    this.touch()
  }

  public markAsPaid(): void {
    if (this.props.isPaid) return
    this.props.isPaid = true
    this.touch()
  }

  public cancelDueToPaymentTimeout(): void {
    if (this.props.status === 'SCHEDULED' && !this.props.isPaid) {
      this.props.status = 'CANCELLED'
      this.touch()
    }
  }

  public reschedule(rescheduleDateTime: { start: Date; end: Date }) {
    if (this.isCompletedOrInProgress()) {
      throw new Error(
        'Cannot reschedule a completed or in progress appointment'
      )
    }

    this.props.rescheduleDateTime = rescheduleDateTime
    this.props.status = 'RESCHEDULED'
    this.touch()
  }

  public isRescheduled() {
    return this.props.status === 'RESCHEDULED'
  }

  public confirm() {
    if (this.isCompletedOrInProgress()) {
      throw new Error('Cannot cancel a completed or in progress appointment')
    }

    if (this.props.status === 'CONFIRMED') {
      return
    }

    this.props.status = 'CONFIRMED'
    this.touch()

    this.addDomainEvent(new ConfirmedAppointmentEvent(this))
  }

  public cancel() {
    if (this.isCompletedOrInProgress()) {
      throw new Error('Cannot cancel a completed or in progress appointment')
    }

    if (this.props.status === 'CANCELLED') {
      return
    }

    this.props.status = 'CANCELLED'
    this.touch()

    this.addDomainEvent(new CanceledAppointmentEvent(this))
  }

  private isCompletedOrInProgress(): boolean {
    return (
      this.props.status === 'IN_PROGRESS' || this.props.status === 'COMPLETED'
    )
  }

  // setAsRescheduled(rescheduleDateTime: { start: Date; end: Date }) {
  //   if (!this.props.isRescheduled) {
  //     throw new Error('Appointment must be marked as rescheduled first')
  //   }

  //   const start = dayjs(rescheduleDateTime.start)
  //   const end = dayjs(rescheduleDateTime.end)

  //   if (!start.isValid() || !end.isValid()) {
  //     throw new Error('Invalid reschedule date')
  //   }

  //   if (start.isAfter(end)) {
  //     throw new Error('Reschedule start must be before end')
  //   }

  //   this.props.rescheduleDateTime = rescheduleDateTime
  //   this.touch()
  // }

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
    props: Optional<AppointmentProps, 'createdAt' | 'status' | 'isPaid'>,
    id?: UniqueEntityId
  ) {
    const appointment = new Appointment(
      {
        ...props,
        status: 'SCHEDULED',
        isPaid: props.isPaid ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    const isNewAppointment = !id

    if (isNewAppointment)
      appointment.addDomainEvent(new ScheduledAppointmentEvent(appointment))

    return appointment
  }
}
