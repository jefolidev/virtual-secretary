import { GoogleCalendarTokenRepository } from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { GoogleCalendarToken } from '@/domain/scheduling/enterprise/entities/google-calendar-token'

export class InMemoryGoogleCalendarTokenRepository implements GoogleCalendarTokenRepository {
  public items: GoogleCalendarToken[] = []

  getAuthUrl(professionalId: string): string {
    return `https://accounts.google.com/o/oauth2/auth?client_id=fake&state=${professionalId}`
  }

  async saveTokensFromCode(
    professionalId: string,
    code: string,
  ): Promise<string> {
    const googleAccountEmail = `professional-${professionalId}@gmail.com`

    const token: GoogleCalendarToken = GoogleCalendarToken.create({
      professionalId,
      accessToken: `access-token-for-${code}`,
      refreshToken: `refresh-token-for-${code}`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      googleAccountEmail,
    })

    await this.items.push(token)

    return googleAccountEmail
  }
}
