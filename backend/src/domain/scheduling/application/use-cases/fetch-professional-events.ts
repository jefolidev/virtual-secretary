import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'

export interface FetchProfessionalEventsUseCaseRequest {
  professionalId: string
  page?: number
}

export type FetchProfessionalEventsUseCaseResponse = Either<
  null,
  { events: GoogleCalendarEvent[] }
>

@Injectable()
export class FetchProfessionalEventsUseCase {
  constructor(
    private googleCalendarEventRepository: GoogleCalendarEventRepository,
  ) {}

  async execute({
    professionalId,
    page = 1,
  }: FetchProfessionalEventsUseCaseRequest): Promise<FetchProfessionalEventsUseCaseResponse> {
    const events =
      await this.googleCalendarEventRepository.findManyByProfessionalId(
        professionalId,
        { page },
      )

    if (!events) {
      return right({ events: [] })
    }

    return right({ events })
  }
}
