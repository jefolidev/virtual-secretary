import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { DomainEvent } from '@src/core/events/domain-event'
import type { Appointment } from '../entities/appointment'

export class CanceledAppointmentEvent implements DomainEvent {
  public ocurredAt: Date
  public appointment: Appointment

  constructor(appointment: Appointment) {
    this.ocurredAt = new Date()
    this.appointment = appointment
  }

  getAggregateId(): UniqueEntityId {
    return this.appointment.id
  }
}
