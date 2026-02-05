import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  GoogleCalendarEvent,
  SyncStatus,
} from '@/domain/scheduling/enterprise/entities/google-calendar-event'
import {
  Appointment as PrismaAppointment,
  CalendarEvent as PrismaCalendarEvent,
} from '@prisma/client'

type PrismaCalendarEventWithAppointment = PrismaCalendarEvent & {
  appointment: PrismaAppointment
}

export class PrismaCalendarEventMapper {
  static toDomain(
    raw: PrismaCalendarEventWithAppointment,
  ): GoogleCalendarEvent {
    return GoogleCalendarEvent.create(
      {
        appointmentId: new UniqueEntityId(raw.appointmentId),
        professionalId: new UniqueEntityId(raw.professionalId),
        googleEventLink: raw.googleEventLink,
        summary: raw.summary,
        description: raw.description,
        startDateTime: raw.startDateTime,
        endDateTime: raw.endDateTime,
        syncStatus: raw.syncStatus as SyncStatus,
        lastSyncedAt: raw.lastSyncedAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(calendarEvent: GoogleCalendarEvent): PrismaCalendarEvent {
    return {
      id: calendarEvent.id.toString(),
      appointmentId: calendarEvent.appointmentId.toString(),
      professionalId: calendarEvent.professionalId.toString(),
      googleEventId: calendarEvent.id.toString(),
      description: calendarEvent.description || '',
      updatedAt: calendarEvent.updatedAt || undefined || null,
      googleEventLink: calendarEvent.googleEventLink,
      summary: calendarEvent.summary,
      startDateTime: calendarEvent.startDateTime,
      endDateTime: calendarEvent.endDateTime,
      syncStatus: calendarEvent.syncStatus,
      lastSyncedAt: calendarEvent.lastSyncedAt,
      createdAt: calendarEvent.createdAt,
    }
  }
}
