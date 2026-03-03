import { PaginationParams } from '@/core/repositories/pagination-params'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'

export interface CalendarEventChange {
  googleEventId: string
  status: string
  startDateTime?: string
  endDateTime?: string
}

export abstract class GoogleCalendarEventRepository {
  abstract findByAppointmentId(
    appointmentId: string,
  ): Promise<GoogleCalendarEvent | null>
  abstract findByGoogleEventId(
    googleEventId: string,
  ): Promise<GoogleCalendarEvent | null>
  abstract findManyByProfessionalId(
    professionalId: string,
    page?: PaginationParams,
  ): Promise<GoogleCalendarEvent[] | null>
  abstract create(
    appointmentId: string,
    calendarEvent: GoogleCalendarEvent,
  ): Promise<{ id: string; htmlLink: string; meetLink?: string }>
  abstract updateEvent(
    professionalId: string,
    eventId: string,
    data: Partial<GoogleCalendarEvent>,
  ): Promise<{ id: string; htmlLink: string }>
  abstract delete(id: string): Promise<void>
  abstract save(calendarEvent: GoogleCalendarEvent): Promise<void>
  abstract listChangedEvents(
    professionalId: string,
    syncToken: string,
  ): Promise<{ changes: CalendarEventChange[]; nextSyncToken: string }>
}
