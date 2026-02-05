import { GoogleCalendarEvent } from '@/domain/scheduling/enterprise/entities/google-calendar-event'

export class CalendarEventPresenter {
  static toHTTP(event: GoogleCalendarEvent) {
    return {
      id: event.id.toString(),
      appointmentId: event.appointmentId.toString(),
      professionalId: event.professionalId.toString(),
      googleEventLink: event.googleEventLink,
      summary: event.summary,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      syncStatus: event.syncStatus,
      lastSyncedAt: event.lastSyncedAt,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }
  }
}
