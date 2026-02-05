// Repository para gerenciar EVENTOS do Google Calendar
export abstract class GoogleCalendarTokenRepository {
  abstract getAuthUrl(professionalId: string): Promise<string>

  abstract saveTokensFromCode(
    professionalId: string,
    code: string,
  ): Promise<string>
}
