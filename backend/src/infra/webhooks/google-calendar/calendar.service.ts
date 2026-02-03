import { GoogleCalendarTokenRepository } from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'

@Injectable()
export class GoogleCalendarService {
  private readonly oauth2Client: InstanceType<typeof google.auth.OAuth2>
  private readonly calendar: ReturnType<typeof google.calendar>

  constructor(
    private readonly configService: ConfigService<Env, true>,
    private readonly tokenRepository: GoogleCalendarTokenRepository,
  ) {
    const clientId = this.configService.get('GOOGLE_CALENDAR_CLIENT_ID')
    const clientSecret = this.configService.get('GOOGLE_CALENDAR_SECRET')
    const apiUri = this.configService.get('API_URI')
    const port = this.configService.get('PORT')

    if (!clientId || !clientSecret) {
      throw new Error(
        'GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_SECRET must be defined in environment variables',
      )
    }

    const redirectUri = `${apiUri}:${port}/webhooks/google/auth/callback`

    this.oauth2Client = new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri,
    })

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
  }

  // Method to generate the URL for user consent (passa professionalId como state)
  getAuthUrl(professionalId: string) {
    const scopes = ['https://www.googleapis.com/auth/calendar']
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: professionalId, // Identifica qual profissional está autenticando
      prompt: 'consent', // Força a obter refresh_token sempre
    })
  }

  // Method to get tokens and save to database
  async saveTokensFromCode(code: string, professionalId: string) {
    const { tokens } = await this.oauth2Client.getToken(code)

    // Buscar informações do usuário Google para pegar o email
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
    this.oauth2Client.setCredentials(tokens)
    const { data } = await oauth2.userinfo.get()

    // Verificar se já existe token para esse profissional
    const existingToken =
      await this.tokenRepository.findByProfessionalId(professionalId)

    if (existingToken) {
      // Atualizar
      await this.tokenRepository.update(professionalId, {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? existingToken.refreshToken,
        expiryDate: tokens.expiry_date ?? null,
        scope: tokens.scope ?? null,
        googleAccountEmail: data.email ?? null,
      })
    } else {
      // Criar novo
      await this.tokenRepository.create({
        professionalId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        tokenType: tokens.token_type ?? 'Bearer',
        expiryDate: tokens.expiry_date ?? null,
        scope: tokens.scope ?? null,
        googleAccountEmail: data.email ?? null,
      })
    }

    return data.email
  }

  // Carregar credenciais do banco para um profissional
  async loadCredentials(professionalId: string) {
    const tokenData =
      await this.tokenRepository.findByProfessionalId(professionalId)

    if (!tokenData) {
      throw new Error(
        `Professional ${professionalId} has not connected Google Calendar`,
      )
    }

    this.oauth2Client.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      token_type: tokenData.tokenType,
      expiry_date: tokenData.expiryDate,
      scope: tokenData.scope ?? undefined,
    })

    // Configura callback para atualizar token quando renovado automaticamente
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        await this.tokenRepository.update(professionalId, {
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date ?? null,
        })
      } else if (tokens.access_token) {
        await this.tokenRepository.update(professionalId, {
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date ?? null,
        })
      }
    })

    return tokenData.googleAccountEmail
  }

  // Method to list upcoming events (requer professionalId)
  async listEvents(professionalId: string, calendarId: string = 'primary') {
    await this.loadCredentials(professionalId)

    const res = await this.calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })
    return res.data.items
  }

  // Method to insert an event (requer professionalId)
  async insertEvent(
    professionalId: string,
    event: any,
    calendarId: string = 'primary',
  ) {
    await this.loadCredentials(professionalId)

    const res = await this.calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    })
    return res.data
  }
}
