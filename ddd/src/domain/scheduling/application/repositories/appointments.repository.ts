import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'

export interface AppointmentsRepository {
  create(appointment: Appointment): Promise<void>
  findMany(): Promise<Appointment[]>
  findById(id: UniqueEntityId): Promise<Appointment | null>
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[] | null>
  findOverlapping(
    profissionalId: UniqueEntityId,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  findManyByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[]>
  findManyByClientId(clientId: UniqueEntityId): Promise<Appointment[]>
  findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[]>
  save(appointment: Appointment): Promise<void>
  findManyByStatus(status: AppointmentStatusType): Promise<Appointment[]>
}
