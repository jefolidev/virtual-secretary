import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'
import type { Appointment } from '../entities/appointment'

export class CanceledAppointmentEvent implements DomainEvent {
  public ocurredAt: Date
  public appointment: Appointment
  public source: 'google-calendar' | 'system'

  constructor(
    appointment: Appointment,
    source: 'google-calendar' | 'system' = 'system',
  ) {
    this.ocurredAt = new Date()
    this.appointment = appointment
    this.source = source
  }

  getAggregateId(): UniqueEntityId {
    return this.appointment.id
  }
}
