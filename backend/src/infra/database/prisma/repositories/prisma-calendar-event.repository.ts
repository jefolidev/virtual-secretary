import { GoogleCalendarEventRepository } from '@/domain/scheduling/application/repositories/google-calendar-event.repository'
import { GoogleCalendarEvent } from '@/domain/scheduling/enterprise/entities/google-calendar-event'
import { Env } from '@/infra/env/env'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { OAuth2Client } from 'google-auth-library'
import { calendar_v3, google } from 'googleapis'
import {
  PrismaCalendarEventMapper,
  PrismaCalendarEventWithAppointment,
} from '../../mappers/prisma-calendar-event-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCalendarEventRepository implements GoogleCalendarEventRepository {
  private oauth2Client: OAuth2Client
  private calendar: calendar_v3.Calendar

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env, true>,
  ) {
    const url = this.configService.get('API_URI')
    const port = this.configService.get('PORT') || 3333
    const fullUrl = `${url}:${port}`

    const environment = this.configService.get('NODE_ENV')
    // `${environment === 'production' ? fullUrl : url}/auth/google/callback`
    this.oauth2Client = new google.auth.OAuth2({
      redirectUri: this.configService.get('GOOGLE_REDIRECT_URI'),
      clientId: this.configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CALENDAR_SECRET'),
    })

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
  }

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<GoogleCalendarEvent | null> {
    const calendarEvent = await this.prisma.calendarEvent.findUnique({
      where: { appointmentId },
      include: {
        appointment: true,
      },
    })

    if (!calendarEvent) {
      return null
    }

    return PrismaCalendarEventMapper.toDomain(
      calendarEvent as PrismaCalendarEventWithAppointment,
    )
  }

  async findByGoogleEventId(
    googleEventId: string,
  ): Promise<GoogleCalendarEvent | null> {
    const calendarEvent = await this.prisma.calendarEvent.findFirst({
      where: { googleEventId },
      include: {
        appointment: true,
      },
    })

    if (!calendarEvent) {
      return null
    }

    return PrismaCalendarEventMapper.toDomain(
      calendarEvent as PrismaCalendarEventWithAppointment,
    )
  }

  async findManyByProfessionalId(
    professionalId: string,
  ): Promise<GoogleCalendarEvent[]> {
    const calendarEvents = await this.prisma.calendarEvent.findMany({
      where: { professionalId },
      orderBy: { startDateTime: 'asc' },
      include: {
        appointment: true,
      },
    })

    return calendarEvents.map(PrismaCalendarEventMapper.toDomain)
  }

  async create(
    appointmentId: string,
    calendarEvent: GoogleCalendarEvent,
  ): Promise<{ id: string; htmlLink: string; meetLink?: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    const token = await this.prisma.googleCalendarToken.findUnique({
      where: { professionalId: appointment.professionalId },
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

    const shouldCreateMeet = appointment.modality === 'ONLINE'

    // Criar evento no Google Calendar
    const googleEvent = await this.calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: shouldCreateMeet ? 1 : 0,
      requestBody: {
        summary: calendarEvent.summary,
        description: calendarEvent.description,
        start: {
          dateTime: calendarEvent.startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: calendarEvent.endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        ...(shouldCreateMeet && {
          conferenceData: {
            createRequest: {
              requestId: `meet-${appointmentId}-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        }),
      },
    })

    // Extrair link do Google Meet
    const meetLink = googleEvent.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video',
    )?.uri

    // Salvar no banco local
    const data = PrismaCalendarEventMapper.toPrisma(calendarEvent)

    const createdEvent = await this.prisma.calendarEvent.create({
      data: {
        ...data,
        googleEventId: googleEvent.data.id!,
        googleEventLink: googleEvent.data.htmlLink!,
        googleMeetLink: meetLink || null,
      },
    })

    return {
      id: createdEvent.id,
      htmlLink: createdEvent.googleEventLink,
      meetLink: createdEvent.googleMeetLink || undefined,
    }
  }

  async updateEvent(
    professionalId: string,
    eventId: string,
    data: Partial<GoogleCalendarEvent>,
  ): Promise<{ id: string; htmlLink: string }> {
    const prismaData = PrismaCalendarEventMapper.toPrisma(
      data as GoogleCalendarEvent,
    )

    const updatedEvent = await this.prisma.calendarEvent.updateMany({
      where: { id: eventId, professionalId },
      data: prismaData,
    })

    if (updatedEvent.count === 0) {
      throw new Error('Calendar event not found or not authorized')
    }

    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Calendar event not found after update')
    }

    return { id: event.id, htmlLink: event.googleEventLink }
  }

  async save(calendarEvent: GoogleCalendarEvent): Promise<void> {
    const data = PrismaCalendarEventMapper.toPrisma(calendarEvent)

    await this.prisma.calendarEvent.update({
      where: { id: data.id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.calendarEvent.delete({
      where: { id },
    })
  }
}
