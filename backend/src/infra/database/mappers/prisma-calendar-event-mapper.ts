import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  GoogleCalendarEvent,
  SyncStatus,
} from '@/domain/scheduling/enterprise/entities/google-calendar-event'
import {
  Appointment as PrismaAppointment,
  CalendarEvent as PrismaCalendarEvent,
} from '@prisma/client'

export type PrismaCalendarEventWithAppointment = PrismaCalendarEvent & {
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
  // Accept partial input and be defensive with undefined values
  static toPrisma(
    calendarEvent: Partial<GoogleCalendarEvent>,
  ): Partial<PrismaCalendarEvent> {
    const safeId = calendarEvent.id ? calendarEvent.id.toString() : undefined
    const safeAppointmentId = calendarEvent.appointmentId
      ? calendarEvent.appointmentId.toString()
      : undefined
    const safeProfessionalId = calendarEvent.professionalId
      ? calendarEvent.professionalId.toString()
      : undefined

    const parseDate = (d: any) => {
      if (!d) return undefined
      if (d instanceof Date) return d
      if (typeof d === 'string') return new Date(d)
      return undefined
    }

    return {
      id: safeId,
      appointmentId: safeAppointmentId,
      professionalId: safeProfessionalId,
      googleEventId: (calendarEvent as any).googleEventId || undefined,
      description: calendarEvent.description ?? undefined,
      updatedAt: calendarEvent.updatedAt ?? undefined,
      googleEventLink: calendarEvent.googleEventLink ?? undefined,
      googleMeetLink: calendarEvent.googleMeetLink ?? undefined,
      summary: calendarEvent.summary ?? undefined,
      startDateTime: parseDate((calendarEvent as any).startDateTime),
      endDateTime: parseDate((calendarEvent as any).endDateTime),
      syncStatus: calendarEvent.syncStatus ?? undefined,
      lastSyncedAt: calendarEvent.lastSyncedAt ?? undefined,
      createdAt: calendarEvent.createdAt ?? undefined,
    }
  }
}
