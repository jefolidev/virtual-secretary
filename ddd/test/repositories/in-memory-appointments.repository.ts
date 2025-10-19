import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { AppointmentsRepository } from '@src/domain/appointments/application/repositories/appointments.repository'
import type {
  Appointment,
  AppointmentStatusType,
} from '@src/domain/appointments/enterprise/entities/appointment'

export class InMemoryAppointmentRepository implements AppointmentsRepository {
  public items: Appointment[] = []

  async create(appointment: Appointment): Promise<void> {
    await this.items.push(appointment)
  }

  async findMany(): Promise<Appointment[]> {
    return await this.items
  }

  async findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const appointment = await this.items.filter((appointment) => {
      return (
        appointment.startDateTime.getTime() >= startDate.getTime() &&
        appointment.endDateTime.getTime() <= endDate.getTime()
      )
    })

    return appointment
  }

  async findById(id: UniqueEntityId): Promise<Appointment | null> {
    const appointment = await this.items.find((appointment) =>
      appointment.id.equals(id)
    )

    return appointment ?? null
  }

  async findOverlapping(
    professionalId: UniqueEntityId,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return this.items.filter((appointment) => {
      return (
        appointment.professionalId.equals(professionalId) &&
        appointment.startDateTime < endDate &&
        appointment.endDateTime > startDate
      )
    })
  }

  async findManyByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<Appointment[]> {
    const appointment = await this.items.filter((appointment) => {
      return appointment.professionalId.equals(professionalId)
    })

    return appointment ?? []
  }

  async findManyByClientId(clientId: UniqueEntityId): Promise<Appointment[]> {
    const appointment = await this.items.filter((appointment) => {
      return appointment.clientId.equals(clientId)
    })

    return appointment ?? []
  }

  async findManyByStatus(
    status: AppointmentStatusType
  ): Promise<Appointment[]> {
    const appointment = await this.items.filter((appointment) => {
      return appointment.status === status
    })

    return appointment ?? []
  }

  async save(appointment: Appointment): Promise<void> {
    const itemIndex = await this.items.findIndex(
      (item) => item.id === appointment.id
    )

    this.items[itemIndex] = appointment
  }
}
