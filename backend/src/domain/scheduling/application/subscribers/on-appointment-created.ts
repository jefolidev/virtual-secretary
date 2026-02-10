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

    console.log(appointment)

    try {
      const result = await this.createCalendarEventUseCase.execute({
        appointmentId: appointment.id.toString(),
      })

      console.log(result)

      if (result.isLeft()) {
        console.warn(
          `[OnAppointmentCreated] Failed to create calendar event for appointment ${appointment.id.toString()}:`,
          result.value?.message || 'Unknown error',
        )
      } else {
        console.log(
          `[OnAppointmentCreated] Calendar event created successfully: ${result.value.eventLink}`,
        )
      }
    } catch (error) {
      console.error(
        `[OnAppointmentCreated] Failed to create Google Calendar event:`,
        error,
      )
    }
  }
}
