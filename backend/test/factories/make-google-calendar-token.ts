import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  GoogleCalendarToken,
  GoogleCalendarTokenProps,
} from '@/domain/scheduling/enterprise/entities/google-calendar-token'

export function makeGoogleCalendarToken(
  override?: Partial<GoogleCalendarTokenProps>,
  id?: UniqueEntityId,
) {
  const token = GoogleCalendarToken.create(
    {
      professionalId: new UniqueEntityId().toString(),
      accessToken: 'ya29.mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      scope: 'https://www.googleapis.com/auth/calendar',
      googleAccountEmail: 'professional@gmail.com',
      ...override,
    },
    id,
  )

  return token
}
