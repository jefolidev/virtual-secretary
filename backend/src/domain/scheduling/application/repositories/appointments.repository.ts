import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'

export interface AppointmentsRepository {
  create(appointment: Appointment): Promise<void>
  findMany(): Promise<Appointment[]>
  findById(id: string): Promise<Appointment | null>
  findByProfessionalId(professionalId: string): Promise<Appointment | null>
  findOverlapping(
    profissionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  findManyByProfessionalId(professionalId: string): Promise<Appointment[]>
  findManyByClientId(clientId: string): Promise<Appointment[]>
  findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[]>
  save(appointment: Appointment): Promise<void>
  findManyByStatus(status: AppointmentStatusType): Promise<Appointment[]>
}
