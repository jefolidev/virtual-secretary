import { Either, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'

export interface EditCalendarEventUseCaseRequest {
  professionalId: string
  eventId: string
  data: Partial<GoogleCalendarEvent>
}

export type EditCalendarEventUseCaseResponse = Either<
  NotFoundError,
  { eventId: string }
>

@Injectable()
export class EditCalendarEventUseCase {
  constructor(
    private googleCalendarEventRepository: GoogleCalendarEventRepository,
  ) {}

  async execute({
    professionalId,
    eventId,
    data,
  }: EditCalendarEventUseCaseRequest): Promise<EditCalendarEventUseCaseResponse> {
    const event = await this.googleCalendarEventRepository.updateEvent(
      professionalId,
      eventId,
      {
        summary: data.summary,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        description: data.description,
      },
    )

    return right({ eventId: event.id })
  }
}
