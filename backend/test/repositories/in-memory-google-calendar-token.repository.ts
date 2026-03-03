import {
    GoogleCalendarTokenRepository,
    WatchChannelData,
} from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { GoogleCalendarToken } from '@/domain/scheduling/enterprise/entities/google-calendar-token'

export class InMemoryGoogleCalendarTokenRepository implements GoogleCalendarTokenRepository {
  public items: GoogleCalendarToken[] = []

  async getAuthUrl(professionalId: string): Promise<string> {
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

  async hasTokens(professionalId: string): Promise<boolean> {
    const token = this.items.find(
      (token) => token.professionalId === professionalId,
    )

    return !!token
  }

  async findByProfessionalId(professionalId: string) {
    const token = this.items.find((t) => t.professionalId === professionalId)
    if (!token) return null
    return {
      id: token.id.toString(),
      professionalId: token.professionalId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: 'Bearer',
      expiryDate: BigInt(Date.now() + 3600 * 1000),
      scope: null,
      googleAccountEmail: token.googleAccountEmail || null,
      watchChannelId: null,
      watchResourceId: null,
      watchExpiration: null,
      syncToken: null,
      createdAt: new Date(),
      updatedAt: null,
    }
  }

  async findByChannelId(_channelId: string) {
    return null
  }

  async saveWatchChannel(
    _professionalId: string,
    _data: WatchChannelData,
  ): Promise<void> {}

  async registerWatch(
    professionalId: string,
    _webhookUrl: string,
  ): Promise<WatchChannelData> {
    return {
      channelId: `channel-${professionalId}`,
      resourceId: `resource-${professionalId}`,
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      syncToken: `sync-token-${professionalId}`,
    }
  }

  async updateSyncToken(
    _professionalId: string,
    _syncToken: string,
  ): Promise<void> {}

  async findExpiringWatches(_beforeDate: Date): Promise<string[]> {
    return []
  }

  async findByGoogleEmail(
    email: string,
  ): Promise<{ professionalId: string; syncToken: string | null } | null> {
    const token = this.items.find((t) => t.googleAccountEmail === email)
    return token ? { professionalId: token.professionalId, syncToken: null } : null
  }

  async invalidateTokens(professionalId: string): Promise<void> {
    this.items = this.items.filter((t) => t.professionalId !== professionalId)
  }
}
