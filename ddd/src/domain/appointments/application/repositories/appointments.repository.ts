import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Appointment } from '../../enterprise/entities/appointment'

export interface AppointmentsRepository {
  save(appointment: Appointment): Promise<void>
  findAppointmentsByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[]>
  findAppointmentsByClientId(clientId: UniqueEntityId): Promise<Appointment[]>
}
