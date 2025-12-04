import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import type { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import type {
  Appointment,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'

export class InMemoryAppointmentRepository implements AppointmentsRepository {
  public items: Appointment[] = []

  async create(appointment: Appointment): Promise<void> {
    await this.items.push(appointment)

    DomainEvents.dispatchEventsForAggregate(appointment.id)
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

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.items.find((appointment) =>
      appointment.id.equals(new UniqueEntityId(id))
    )

    return appointment ?? null
  }

  async findOverlapping(
    professionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return this.items.filter((appointment) => {
      return (
        appointment.professionalId.equals(new UniqueEntityId(professionalId)) &&
        appointment.startDateTime < endDate &&
        appointment.endDateTime > startDate
      )
    })
  }

  async findByProfessionalId(
    professionalId: string
  ): Promise<Appointment[] | null> {
    const appointments = await this.items.filter((appointment) =>
      appointment.id.equals(new UniqueEntityId(professionalId))
    )
    return appointments || null
  }

  async findManyByProfessionalId(
    professionalId: string
  ): Promise<Appointment[]> {
    const appointment = await this.items.filter((appointment) => {
      return appointment.professionalId.equals(
        new UniqueEntityId(professionalId)
      )
    })

    return appointment ?? []
  }

  async findManyByClientId(clientId: string): Promise<Appointment[]> {
    const appointment = await this.items.filter((appointment) => {
      return appointment.clientId.equals(new UniqueEntityId(clientId))
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

    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }
}
