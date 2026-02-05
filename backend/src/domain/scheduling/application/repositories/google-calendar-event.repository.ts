import { PaginationParams } from '@/core/repositories/pagination-params'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'

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
  ): Promise<{ id: string; htmlLink: string }>
  abstract updateEvent(
    professionalId: string,
    eventId: string,
    data: Partial<GoogleCalendarEvent>,
  ): Promise<{ id: string; htmlLink: string }>
  abstract delete(id: string): Promise<void>

}
