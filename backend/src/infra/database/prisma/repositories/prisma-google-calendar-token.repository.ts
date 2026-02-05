import { GoogleCalendarTokenRepository } from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import type { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaGoogleCalendarTokenRepository implements GoogleCalendarTokenRepository {
  private oauth2Client: OAuth2Client

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env, true>,
  ) {
    const url = this.configService.get('API_URI')

    this.oauth2Client = new google.auth.OAuth2({
      redirectUri: `${url}/auth/google/callback`,

      clientId: this.configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CALENDAR_SECRET'),
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
    const { tokens } = await this.oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain tokens from Google')
    }

    // Set credentials BEFORE making API calls
    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    })

    // Try to get user email, but don't fail if it doesn't work
    let googleAccountEmail = 'unknown'
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
      const { data } = await oauth2.userinfo.get()
      googleAccountEmail = data.email || 'unknown'
    } catch (error) {
      console.warn('Failed to get user email from Google:', error)
    }

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

    return googleAccountEmail
  }
}
