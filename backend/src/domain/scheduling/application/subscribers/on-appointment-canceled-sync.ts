import { InvalidGrantError } from '@/core/errors/invalid-grand-error'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { Injectable } from '@nestjs/common'
import { CanceledAppointmentEvent } from '../../enterprise/events/canceled-appointment'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'

@Injectable()
export class OnAppointmentCanceledSync implements EventHandler {
  constructor(
    private googleCalendarEventRepository: GoogleCalendarEventRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.deleteGoogleCalendarEvent.bind(this),
      CanceledAppointmentEvent.name,
    )
  }

  private async deleteGoogleCalendarEvent(event: CanceledAppointmentEvent) {
    const { appointment } = event

    if (!appointment.syncWithGoogleCalendar) {
      return
    }

    try {
      const calendarEvent =
        await this.googleCalendarEventRepository.findByAppointmentId(
          appointment.id.toString(),
        )

      if (!calendarEvent) {
        return
      }

      await this.googleCalendarEventRepository.delete(
        calendarEvent.id.toString(),
      )
    } catch (error) {
      if (error instanceof InvalidGrantError) {
        console.warn(
          `[OnAppointmentCanceledSync] Google token expired for appointment ${appointment.id.toString()} — skipping Google Calendar deletion`,
        )
        return
      }
      console.error(
        `[OnAppointmentCanceledSync] Unexpected error deleting Google Calendar event:`,
        error,
      )
    }
  }
}
