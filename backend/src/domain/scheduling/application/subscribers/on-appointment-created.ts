import { InvalidGrantError } from '@/core/errors/invalid-grand-error'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { Injectable } from '@nestjs/common'
import { AppointmentCreatedEvent } from '../../enterprise/events/appointment-created-event'
import { CreateCalendarEventUseCase } from '../use-cases/create-calendar-event'

@Injectable()
export class OnAppointmentCreated implements EventHandler {
  constructor(private createCalendarEventUseCase: CreateCalendarEventUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.createGoogleCalendarEvent.bind(this),
      AppointmentCreatedEvent.name,
    )
  }

  private async createGoogleCalendarEvent(event: AppointmentCreatedEvent) {
    const { appointment } = event

    if (!appointment.syncWithGoogleCalendar) {
      console.log(
        `[OnAppointmentCreated] Skipping Google Calendar sync for appointment ${appointment.id.toString()}`,
      )
      return
    }

    try {
      const result = await this.createCalendarEventUseCase.execute({
        appointmentId: appointment.id.toString(),
      })

      if (result.isLeft()) {
        if (result.value instanceof InvalidGrantError) {
          console.warn(
            `[OnAppointmentCreated] Google Calendar sync failed for appointment ${appointment.id.toString()} — token invalid or expired. Professional ${appointment.professionalId.toString()} should reconnect from settings.`,
          )
          return
        }
      }

      // console.log(
      //   `[OnAppointmentCreated] Calendar event created successfully: ${result.value.eventLink}`,
      // )
    } catch (error) {
      console.error(
        `[OnAppointmentCreated] Unexpected error creating Google Calendar event:`,
        error,
      )
    }
  }
}
