import { Either, right } from '@/core/either'
import { GoogleCalendarService } from '@/infra/webhooks/google-calendar/calendar.service'
import { Injectable } from '@nestjs/common'

export interface GetAuthUrlUseCaseRequest {
  professionalId: string
}

export type GetAuthUrlUseCaseResponse = Either<null, { authUrl: string }>

@Injectable()
export class GetAuthUrlUseCase {
  constructor(private googleCalendar: GoogleCalendarService) {}

  async execute({ professionalId }: { professionalId: string }) {
    const authUrl = await this.googleCalendar.getAuthUrl(professionalId)
    return right({ authUrl })
  }
}
