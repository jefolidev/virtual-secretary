import { InvalidGrantError } from '@/core/errors/invalid-grand-error'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { Injectable } from '@nestjs/common'
import { RescheduledAppointmentEvent } from '../../enterprise/events/rescheduled-appointment'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'
import { EditCalendarEventUseCase } from '../use-cases/edit-calendar-event'

@Injectable()
export class OnAppointmentRescheduled implements EventHandler {
  constructor(
    private googleCalendarEventRepository: GoogleCalendarEventRepository,
    private editCalendarEventUseCase: EditCalendarEventUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.updateGoogleCalendarEvent.bind(this),
      RescheduledAppointmentEvent.name,
    )
  }

  private async updateGoogleCalendarEvent(event: RescheduledAppointmentEvent) {
    const { appointment } = event

    if (!appointment.syncWithGoogleCalendar) {
      return
    }

    if (!appointment.rescheduleDateTime) {
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

      await this.editCalendarEventUseCase.execute({
        professionalId: appointment.professionalId.toString(),
        eventId: calendarEvent.id.toString(),
        data: {
          startDateTime: appointment.rescheduleDateTime.start,
          endDateTime: appointment.rescheduleDateTime.end,
        } as any,
      })
    } catch (error) {
      if (error instanceof InvalidGrantError) {
        console.warn(
          `[OnAppointmentRescheduled] Google token expired for appointment ${appointment.id.toString()} — skipping Google Calendar update`,
        )
        return
      }
      console.error(
        `[OnAppointmentRescheduled] Unexpected error updating Google Calendar event:`,
        error,
      )
    }
  }
}
