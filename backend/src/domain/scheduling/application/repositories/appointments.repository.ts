import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'

export abstract class AppointmentsRepository {
  abstract create(appointment: Appointment): Promise<void>
  abstract findMany(): Promise<Appointment[]>
  abstract findById(id: string): Promise<Appointment | null>
  abstract findByProfessionalId(
    professionalId: string
  ): Promise<Appointment | null>
  abstract findOverlapping(
    profissionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  abstract findManyByProfessionalId(
    professionalId: string
  ): Promise<Appointment[]>
  abstract findManyByClientId(clientId: string): Promise<Appointment[]>
  abstract findManyByDate(
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  abstract save(appointment: Appointment): Promise<void>
  abstract findManyByStatus(
    status: AppointmentStatusType
  ): Promise<Appointment[]>
}
