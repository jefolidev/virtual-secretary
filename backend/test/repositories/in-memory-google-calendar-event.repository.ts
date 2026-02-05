import { GoogleCalendarEventRepository } from '@/domain/scheduling/application/repositories/google-calendar-event.repository'
import { GoogleCalendarEvent } from '@/domain/scheduling/enterprise/entities/google-calendar-event'

export class InMemoryGoogleCalendarEventRepository implements GoogleCalendarEventRepository {
  public items: GoogleCalendarEvent[] = []

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<GoogleCalendarEvent | null> {
    return (
      (await this.items.find(
        (item) => item.appointmentId.toString() === appointmentId,
      )) || null
    )
  }

  async findByGoogleEventId(
    googleEventId: string,
  ): Promise<GoogleCalendarEvent | null> {
    return (
      (await this.items.find((item) => item.id.toString() === googleEventId)) ||
      null
    )
  }

  async findManyByProfessionalId(
    professionalId: string,
    pagination?: { page?: number; perPage?: number },
  ): Promise<GoogleCalendarEvent[] | null> {
    const page = pagination?.page ?? 1
    const perPage = pagination?.perPage ?? 20

    const professionalEvents = this.items.filter(
      (item) => item.professionalId.toString() === professionalId,
    )

    if (professionalEvents.length === 0) {
      return null
    }

    // Paginação: skip = (page - 1) * perPage
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage

    const paginatedEvents = professionalEvents.slice(startIndex, endIndex)

    return paginatedEvents.length > 0 ? paginatedEvents : null
  }

  async create(
    appointmentId: string,
    calendarEvent: GoogleCalendarEvent,
  ): Promise<{ id: string; htmlLink: string }> {
    this.items.push(calendarEvent)
    return {
      id: calendarEvent.id.toString(),
      htmlLink: calendarEvent.googleEventLink,
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  async updateEvent(
    professionalId: string,
    eventId: string,
    data: Partial<GoogleCalendarEvent>,
  ): Promise<{ id: string; htmlLink: string }> {
    const professionalEvents = this.items.filter(
      (item) => item.professionalId.toString() === professionalId,
    )

    const eventIndex = professionalEvents.findIndex(
      (e) => e.id.toString() === eventId,
    )

    if (eventIndex !== -1) {
      const event = professionalEvents[eventIndex]
      Object.assign(event, data)
    }

    return {
      id: eventId,
      htmlLink: `https://calendar.google.com/event?eid=${eventId}`,
    }
  }

  async hasTokens(professionalId: string): Promise<boolean> {
    const hasToken = this.items.some(
      (item) => item.professionalId.toString() === professionalId,
    )
    return hasToken
  }
}
