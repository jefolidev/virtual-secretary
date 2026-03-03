import {
    GoogleCalendarTokenRepository,
    WatchChannelData,
} from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import type { OAuth2Client } from 'google-auth-library'
import { calendar_v3, google } from 'googleapis'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaGoogleCalendarTokenRepository implements GoogleCalendarTokenRepository {
  private oauth2Client: OAuth2Client
  private calendar: calendar_v3.Calendar

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env, true>,
  ) {
    const apiUri = this.configService.get('API_URI')
    const port = this.configService.get('PORT') || 3333
    const fullUrl = `${apiUri}:${port}`

    const environment = this.configService.get('NODE_ENV')
    const baseUrl = apiUri.endsWith(':') ? apiUri.slice(0, -1) : apiUri

    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI')

    this.oauth2Client = new google.auth.OAuth2({
      redirectUri,
      clientId: this.configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CALENDAR_SECRET'),
    })

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
  }

  async findByProfessionalId(professionalId: string) {
    return this.prisma.googleCalendarToken.findUnique({
      where: { professionalId },
    })
  }

  async getAuthUrl(professionalId: string): Promise<string> {
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
    })

    if (!professional) {
      throw new Error('Professional not found.')
    }

    const state = JSON.stringify({
      professionalId: professional.id,
      nonce: crypto.randomBytes(16).toString('hex'),
    })

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
      prompt: 'consent',
    })

    return authUrl
  }

  async saveTokensFromCode(
    professionalId: string,
    code: string,
  ): Promise<string> {
    let tokens
    try {
      const response = await this.oauth2Client.getToken(code)
      tokens = response.tokens

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain tokens from Google')
      }
    } catch (error) {
      throw error
    }

    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    })

    let googleAccountEmail = 'unknown'
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
      const { data } = await oauth2.userinfo.get()
      googleAccountEmail = data.email || 'unknown'
    } catch (error) {
      console.warn('Failed to get user email from Google:', error)
    }

    const beforeStatus = await this.prisma.professional.findUnique({
      where: { id: professionalId },
      select: { googleConnectionStatus: true },
    })

    await this.prisma.googleCalendarToken.upsert({
      where: { professionalId },
      create: {
        professionalId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type || 'Bearer',
        expiryDate: tokens.expiry_date
          ? BigInt(tokens.expiry_date)
          : BigInt(Date.now() + 3600 * 1000),
        scope: tokens.scope || 'https://www.googleapis.com/auth/calendar',
        googleAccountEmail,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type || 'Bearer',
        expiryDate: tokens.expiry_date
          ? BigInt(tokens.expiry_date)
          : BigInt(Date.now() + 3600 * 1000),
        scope: tokens.scope || 'https://www.googleapis.com/auth/calendar',
        googleAccountEmail,
        updatedAt: new Date(),
      },
    })

    await this.prisma.professional.update({
      where: { id: professionalId },
      data: { googleConnectionStatus: 'CONNECTED' },
    })
    return googleAccountEmail
  }

  async hasTokens(professionalId: string): Promise<boolean> {
    const token = await this.prisma.googleCalendarToken.findUnique({
      where: { professionalId },
    })

    return !!token
  }

  async invalidateTokens(professionalId: string): Promise<void> {
    await this.prisma.googleCalendarToken.delete({
      where: { professionalId },
    })

    await this.prisma.professional.update({
      where: { id: professionalId },
      data: { googleConnectionStatus: 'ERROR' },
    })
  }

  async registerWatch(
    professionalId: string,
    webhookUrl: string,
  ): Promise<WatchChannelData> {
    const token = await this.prisma.googleCalendarToken.findUnique({
      where: { professionalId },
    })

    if (!token) {
      throw new Error('Professional has not connected Google Calendar')
    }

    this.oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      token_type: token.tokenType,
      expiry_date: Number(token.expiryDate),
    })

    const channelId = crypto.randomUUID()

    const watchResponse = await this.calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
      },
    })

    const expiration = new Date(Number(watchResponse.data.expiration))
    const resourceId = watchResponse.data.resourceId || ''

    // Paginate until we reach the last page, which carries nextSyncToken
    let syncToken = ''
    let pageToken: string | undefined = undefined
    do {
      const listResponse = await this.calendar.events.list({
        calendarId: 'primary',
        maxResults: 250,
        pageToken,
      })
      if (listResponse.data.nextSyncToken) {
        syncToken = listResponse.data.nextSyncToken
        break
      }
      pageToken = listResponse.data.nextPageToken ?? undefined
    } while (pageToken)

    const watchData: WatchChannelData = {
      channelId,
      resourceId,
      expiration,
      syncToken,
    }

    await this.saveWatchChannel(professionalId, watchData)

    return watchData
  }

  async findByChannelId(channelId: string): Promise<{
    professionalId: string
    accessToken: string
    refreshToken: string
    tokenType: string
    expiryDate: bigint | null
    syncToken: string | null
    watchChannelId: string | null
    watchExpiration: Date | null
  } | null> {
    const token = await this.prisma.googleCalendarToken.findUnique({
      where: { watchChannelId: channelId },
    })

    if (!token) return null

    return {
      professionalId: token.professionalId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
      expiryDate: token.expiryDate,
      syncToken: token.syncToken,
      watchChannelId: token.watchChannelId,
      watchExpiration: token.watchExpiration,
    }
  }

  async findByGoogleEmail(
    email: string,
  ): Promise<{ professionalId: string; syncToken: string | null } | null> {
    const token = await this.prisma.googleCalendarToken.findFirst({
      where: { googleAccountEmail: email },
      select: { professionalId: true, syncToken: true },
    })

    return token ?? null
  }

  async saveWatchChannel(
    professionalId: string,
    data: WatchChannelData,
  ): Promise<void> {
    await this.prisma.googleCalendarToken.update({
      where: { professionalId },
      data: {
        watchChannelId: data.channelId,
        watchResourceId: data.resourceId,
        watchExpiration: data.expiration,
        syncToken: data.syncToken,
      },
    })
  }

  async updateSyncToken(
    professionalId: string,
    syncToken: string,
  ): Promise<void> {
    await this.prisma.googleCalendarToken.update({
      where: { professionalId },
      data: { syncToken },
    })
  }

  async findExpiringWatches(beforeDate: Date): Promise<string[]> {
    const tokens = await this.prisma.googleCalendarToken.findMany({
      where: {
        watchChannelId: { not: null },
        watchExpiration: { lte: beforeDate },
      },
      select: { professionalId: true },
    })

    return tokens.map((t) => t.professionalId)
  }
}
