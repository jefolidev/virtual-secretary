// Repository para gerenciar EVENTOS do Google Calendar
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
    createdAt: Date
    updatedAt: Date | null
  } | null>

  abstract invalidateTokens(professionalId: string): Promise<void>
  abstract hasTokens(professionalId: string): Promise<boolean>
}
