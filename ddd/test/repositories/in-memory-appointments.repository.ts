import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { AppointmentsRepository } from '@/domain/appointments/application/repositories/appointments.repository'
import type { Appointment } from '@/domain/appointments/enterprise/entities/appointment'

export class InMemoryAppointmentRepository implements AppointmentsRepository {
  save(appointment: Appointment): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findAppointmentsByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findAppointmentsByClientId(clientId: UniqueEntityId): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
}
