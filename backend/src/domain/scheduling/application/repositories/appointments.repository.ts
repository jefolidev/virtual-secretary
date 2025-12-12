import { PaginationParams } from '@/core/repositories/pagination-params'
import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'

export abstract class AppointmentsRepository {
  abstract create(appointment: Appointment): Promise<void>
  abstract findMany(params?: PaginationParams): Promise<Appointment[]>
  abstract findById(id: string): Promise<Appointment | null>
  abstract findOverlapping(
    profissionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  abstract findManyByProfessionalId(
    professionalId: string,
    params?: PaginationParams
  ): Promise<Appointment[]>
  abstract findManyByClientId(
    clientId: string,
    params?: PaginationParams
  ): Promise<Appointment[]>
  abstract findManyByDate(
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  abstract save(appointment: Appointment): Promise<void>
  abstract findManyByStatus(
    status: AppointmentStatusType,
    params?: PaginationParams
  ): Promise<Appointment[]>
}
