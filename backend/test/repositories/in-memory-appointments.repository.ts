import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
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

  async findMany(
    params: PaginationParams = { page: 1 }
  ): Promise<Appointment[]> {
    const { page } = params
    const appointments = await this.items.slice((page - 1) * 10, page * 10)
    return appointments
  }

  async findManyByDate(
    startDate: Date,
    endDate: Date,
    params: PaginationParams = { page: 1 }
  ): Promise<Appointment[]> {
    const { page } = params
    const appointment = await this.items
      .filter((appointment) => {
        return (
          appointment.startDateTime.getTime() >= startDate.getTime() &&
          appointment.endDateTime.getTime() <= endDate.getTime()
        )
      })
      .slice((page - 1) * 10, page * 10)

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
    const appointment = this.items.filter((appointment) => {
      console.log(appointment.effectiveStartDateTime.getTime())
      console.log(appointment.effectiveEndDateTime.getTime())
      console.log(appointment.isRescheduled())
      return (
        appointment.professionalId.toString() === professionalId &&
        appointment.effectiveStartDateTime.getTime() <= endDate.getTime() &&
        appointment.effectiveEndDateTime.getTime() >= startDate.getTime()
      )
    })

    return appointment
  }

  async findByProfessionalId(
    professionalId: string
  ): Promise<Appointment | null> {
    const appointment = this.items.find((appointment) => {
      return appointment.professionalId.equals(
        new UniqueEntityId(professionalId)
      )
    })

    return appointment ?? null
  }

  async findManyByProfessionalId(
    professionalId: string,
    params: PaginationParams = { page: 1 }
  ): Promise<Appointment[]> {
    const { page } = params
    const appointment = await this.items
      .filter((appointment) => {
        return appointment.professionalId.equals(
          new UniqueEntityId(professionalId)
        )
      })
      .slice((page - 1) * 10, page * 10)

    return appointment ?? []
  }

  async findManyByClientId(
    clientId: string,
    params: PaginationParams = { page: 1 }
  ): Promise<Appointment[]> {
    const { page } = params
    const appointment = await this.items
      .filter((appointment) => {
        return appointment.clientId.equals(new UniqueEntityId(clientId))
      })
      .slice((page - 1) * 10, page * 10)

    return appointment ?? []
  }

  async findManyByStatus(
    status: AppointmentStatusType,
    params: PaginationParams = { page: 1 }
  ): Promise<Appointment[]> {
    const { page } = params
    const appointment = await this.items
      .filter((appointment) => {
        return appointment.status === status
      })
      .slice((page - 1) * 10, page * 10)

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
