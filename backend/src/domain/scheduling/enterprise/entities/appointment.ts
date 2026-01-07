import { AggregateRoot } from '@/core/entities/aggregate'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
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

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'

export interface AppointmentProps {
  clientId: UniqueEntityId
  professionalId: UniqueEntityId
  paymentId?: UniqueEntityId
  startDateTime: Date
  endDateTime: Date
  modality: AppointmentModalityType
  agreedPrice: number
  status: AppointmentStatusType
  paymentStatus: PaymentStatus
  googleMeetLink?: string
  rescheduleDateTime?: { start: Date; end: Date }
  isPaid: boolean
  startedAt?: Date | null
  totalElapsedMs?: number | null
  createdAt: Date
  updatedAt?: Date | null
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

  get effectiveStartDateTime() {
    return this.isRescheduled()
      ? this.props.rescheduleDateTime!.start
      : this.props.startDateTime
  }

  get effectiveEndDateTime() {
    return this.isRescheduled()
      ? this.props.rescheduleDateTime!.end
      : this.props.endDateTime
  }

  get modality() {
    return this.props.modality
  }

  set modality(modality: AppointmentModalityType) {
    this.props.modality = modality
    this.touch()
  }

  get agreedPrice() {
    return this.props.agreedPrice
  }

  set agreedPrice(agreedPrice: number) {
    this.props.agreedPrice = agreedPrice
  }

  get status() {
    return this.props.status
  }

  set status(status: AppointmentStatusType) {
    this.props.status = status
    this.touch()
  }

  get paymentStatus() {
    return this.props.paymentStatus
  }

  set paymentStatus(paymentStatus: PaymentStatus) {
    this.props.paymentStatus = paymentStatus
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

  get startedAt() {
    return this.props.startedAt ?? null
  }

  set startedAt(startedAt: Date | null) {
    this.props.startedAt = startedAt
    this.touch()
  }

  get totalElapsedMs() {
    return this.props.totalElapsedMs ?? 0
  }

  set totalElapsedMs(totalElapsedMs: number | null) {
    this.props.totalElapsedMs = totalElapsedMs
    this.touch()
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
  public isCancelled() {
    return this.props.status === 'CANCELLED'
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

  public start() {
    if (this.props.status !== 'SCHEDULED') {
      throw new Error('Can only start a scheduled appointment')
    }

    this.props.status = 'IN_PROGRESS'
    this.props.startedAt = new Date()
    this.touch()
  }

  public pause() {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new Error('Can only pause an appointment that is in progress')
    }

    if (!this.props.startedAt) {
      throw new Error('Cannot pause: appointment has no started_at timestamp')
    }

    const now = new Date()
    const elapsedMs = now.getTime() - this.props.startedAt.getTime()

    this.props.totalElapsedMs = (this.props.totalElapsedMs ?? 0) + elapsedMs
    this.props.startedAt = null
    this.touch()
  }

  public resume() {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new Error('Can only resume an appointment that is in progress')
    }

    if (this.props.startedAt) {
      throw new Error('Cannot resume: appointment is already running')
    }

    this.props.startedAt = new Date()
    this.touch()
  }

  public complete() {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new Error('Can only complete an appointment that is in progress')
    }

    // If appointment is currently running (not paused), calculate final elapsed time
    if (this.props.startedAt) {
      const now = new Date()
      const elapsedMs = now.getTime() - this.props.startedAt.getTime()
      this.props.totalElapsedMs = (this.props.totalElapsedMs ?? 0) + elapsedMs
    }

    this.props.status = 'COMPLETED'
    this.props.startedAt = null
    this.touch()
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
    props: Optional<
      AppointmentProps,
      | 'createdAt'
      | 'status'
      | 'isPaid'
      | 'paymentStatus'
      | 'startedAt'
      | 'totalElapsedMs'
    >,
    id?: UniqueEntityId
  ) {
    const appointment = new Appointment(
      {
        ...props,
        status: props.status ?? 'SCHEDULED',
        paymentStatus: 'PENDING',
        isPaid: props.isPaid ?? false,
        startedAt: props.startedAt ?? null,
        totalElapsedMs: props.totalElapsedMs ?? null,
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
