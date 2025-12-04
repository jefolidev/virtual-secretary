import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import {
  Appointment,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'

class PrismaAppointmentsRepository implements AppointmentsRepository {
  create(appointment: Appointment): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findById(id: UniqueEntityId): Promise<Appointment | null> {
    throw new Error('Method not implemented.')
  }
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[] | null> {
    throw new Error('Method not implemented.')
  }
  findOverlapping(
    profissionalId: UniqueEntityId,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findManyByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findManyByClientId(clientId: UniqueEntityId): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  save(appointment: Appointment): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findManyByStatus(status: AppointmentStatusType): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
}
