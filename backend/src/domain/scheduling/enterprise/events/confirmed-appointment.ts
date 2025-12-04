import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'
import { Appointment } from '../entities/appointment'

export class ConfirmedAppointmentEvent implements DomainEvent {
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
