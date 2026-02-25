import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import type { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { FetchScheduleByProfesionalIdFilters } from '@/domain/scheduling/application/use-cases/fetch-schedule-by-professional-id'
import type {
  Appointment,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'
import {
  Reminders,
  ReminderTypes,
} from '@/domain/scheduling/enterprise/entities/reminders'
import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'

export class InMemoryAppointmentRepository implements AppointmentsRepository {
  async countAppointmentsByProfessionalId(
    professionalId: string,
    filters?: FetchScheduleByProfesionalIdFilters,
  ): Promise<number> {
    let filtered = this.items.filter((appointment) =>
      appointment.professionalId.equals(new UniqueEntityId(professionalId)),
    )

    if (filters?.status) {
      filtered = filtered.filter(
        (appointment) => appointment.status === filters.status,
      )
    }
    if (filters?.modality) {
      filtered = filtered.filter(
        (appointment) => appointment.modality === filters.modality,
      )
    }

    if (filters?.paymentStatus) {
      filtered = filtered.filter(
        (appointment) => appointment.paymentStatus === filters.paymentStatus,
      )
    }

    if (filters?.period) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = appointment.startDateTime
        const now = new Date()

        if (filters.period === 'last-month') {
          const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
          )
          return appointmentDate < now && appointmentDate > oneMonthAgo
        }

        if (filters.period === 'last-week') {
          const oneWeekAgo = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7,
          )
          return appointmentDate > oneWeekAgo && appointmentDate < now
        }

        if (filters.period === 'last-year') {
          const oneYearAgo = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate(),
          )
          return appointmentDate > oneYearAgo && appointmentDate < now
        }

        return true
      })
    }

    if (filters?.status) {
      filtered = filtered.filter(
        (appointment) => appointment.status === filters.status,
      )
    }

    return filtered.length
  }
  public items: Appointment[] = []

  async create(appointment: Appointment): Promise<void> {
    await this.items.push(appointment)

    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }

  async markReminderAsSended(
    appointmentId: string,
    reminder: ReminderTypes,
  ): Promise<void> {
    const appointment = await this.findById(appointmentId)

    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const newReminder = Reminders.create({
      appointmentId,
      type: reminder,
      sentAt: new Date(),
    })

    appointment.reminders = newReminder

    await this.save(appointment)
  }

  async findMany(
    params: PaginationParams = { page: 1 },
  ): Promise<Appointment[]> {
    const { page } = params
    const appointments = await this.items.slice((page - 1) * 10, page * 10)
    return appointments
  }

  async findManyByDate(
    startDate: Date,
    endDate: Date,
    params: PaginationParams = { page: 1 },
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
      appointment.id.equals(new UniqueEntityId(id)),
    )

    return appointment ?? null
  }

  async findOverlapping(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const blockingStatuses = [
      'SCHEDULED',
      'CONFIRMED',
      'RESCHEDULED',
      'IN_PROGRESS',
    ]

    const appointment = this.items.filter((appointment) => {
      return (
        appointment.professionalId.toString() === professionalId &&
        blockingStatuses.includes(appointment.status) &&
        appointment.effectiveStartDateTime.getTime() <= endDate.getTime() &&
        appointment.effectiveEndDateTime.getTime() >= startDate.getTime()
      )
    })

    return appointment
  }

  async findByProfessionalId(
    professionalId: string,
  ): Promise<Appointment | null> {
    const appointment = this.items.find((appointment) => {
      return appointment.professionalId.equals(
        new UniqueEntityId(professionalId),
      )
    })

    return appointment ?? null
  }

  async findManyByProfessionalId(
    professionalId: string,
    params: PaginationParams = { page: 1 },
  ): Promise<AppointmentWithClient[]> {
    const { page } = params
    const appointments = this.items
      .filter((appointment) => {
        return appointment.professionalId.equals(
          new UniqueEntityId(professionalId),
        )
      })
      .slice((page - 1) * 10, page * 10)

    // Mapear Appointment para AppointmentWithClient
    return appointments.map((appointment) => {
      return appointment as unknown as AppointmentWithClient
    })
  }

  async findManyByClientId(
    clientId: string,
    params: PaginationParams = { page: 1 },
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
    params: PaginationParams = { page: 1 },
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
    const itemIndex = await this.items.findIndex((item) =>
      item.id.equals(appointment.id),
    )

    this.items[itemIndex] = appointment

    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }

  async scheduleFromRawData(data: any): Promise<void> {
    // Mock implementation for testing
    // This method is not used in the calendar event tests
  }

  async findByGoogleEventId(
    googleEventId: string,
  ): Promise<Appointment | null> {
    const appointment = this.items.find(
      (appointment) => appointment.googleCalendarEventId === googleEventId,
    )

    return appointment ?? null
  }
}
