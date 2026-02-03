import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  CalendarEvent,
  SyncStatus,
} from '@/domain/scheduling/enterprise/entities/google-calendar-event'
import { Prisma, CalendarEvent as PrismaCalendarEvent } from '@prisma/client'

export class PrismaCalendarEventMapper {
  static toDomain(raw: PrismaCalendarEvent): CalendarEvent {
    return CalendarEvent.create(
      {
        appointmentId: new UniqueEntityId(raw.appointmentId),
        professionalId: new UniqueEntityId(raw.professionalId),
        googleEventId: raw.googleEventId,
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

  static toPrisma(
    calendarEvent: CalendarEvent,
  ): Prisma.CalendarEventUncheckedCreateInput {
    return {
      id: calendarEvent.id.toString(),
      appointmentId: calendarEvent.appointmentId.toString(),
      professionalId: calendarEvent.professionalId.toString(),
      googleEventId: calendarEvent.googleEventId,
      googleEventLink: calendarEvent.googleEventLink,
      summary: calendarEvent.summary,
      description: calendarEvent.description,
      startDateTime: calendarEvent.startDateTime,
      endDateTime: calendarEvent.endDateTime,
      syncStatus: calendarEvent.syncStatus,
      lastSyncedAt: calendarEvent.lastSyncedAt,
      createdAt: calendarEvent.createdAt,
      updatedAt: calendarEvent.updatedAt,
    }
  }
}
