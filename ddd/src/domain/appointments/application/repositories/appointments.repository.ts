import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Appointment } from '../../enterprise/entities/appointment'

export interface AppointmentsRepository {
  create(appointment: Appointment): Promise<void>
  findMany(): Promise<Appointment[]>
  findById(id: UniqueEntityId): Promise<Appointment | null>
  findOverlapping(
    profissionalId: UniqueEntityId,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[] | null>
  findManyByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[]>
  findManyByClientId(clientId: UniqueEntityId): Promise<Appointment[]>
  findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[] | null>
  save(appointment: Appointment): Promise<void>
}
