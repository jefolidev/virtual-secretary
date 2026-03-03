// Repository para gerenciar EVENTOS do Google Calendar

export interface WatchChannelData {
  channelId: string
  resourceId: string
  expiration: Date
  syncToken: string
}

export abstract class GoogleCalendarTokenRepository {
  abstract getAuthUrl(professionalId: string): Promise<string>

  abstract saveTokensFromCode(
    professionalId: string,
    code: string,
  ): Promise<string>
  abstract findByProfessionalId(professionalId: string): Promise<{
    id: string
    professionalId: string
    accessToken: string
    refreshToken: string
    tokenType: string
    expiryDate: bigint | null
    scope: string | null
    googleAccountEmail: string | null
    watchChannelId: string | null
    watchResourceId: string | null
    watchExpiration: Date | null
    syncToken: string | null
    createdAt: Date
    updatedAt: Date | null
  } | null>

  abstract findByChannelId(channelId: string): Promise<{
    professionalId: string
    accessToken: string
    refreshToken: string
    tokenType: string
    expiryDate: bigint | null
    syncToken: string | null
    watchChannelId: string | null
    watchExpiration: Date | null
  } | null>

  abstract saveWatchChannel(
    professionalId: string,
    data: WatchChannelData,
  ): Promise<void>

  abstract registerWatch(
    professionalId: string,
    webhookUrl: string,
  ): Promise<WatchChannelData>

  abstract updateSyncToken(
    professionalId: string,
    syncToken: string,
  ): Promise<void>

  abstract findExpiringWatches(beforeDate: Date): Promise<string[]>

  abstract findByGoogleEmail(
    email: string,
  ): Promise<{ professionalId: string; syncToken: string | null } | null>

  abstract invalidateTokens(professionalId: string): Promise<void>
  abstract hasTokens(professionalId: string): Promise<boolean>
}
