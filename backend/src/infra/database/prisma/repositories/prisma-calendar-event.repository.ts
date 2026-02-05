import { GoogleCalendarEventRepository } from '@/domain/scheduling/application/repositories/google-calendar-event.repository'
import { GoogleCalendarEvent } from '@/domain/scheduling/enterprise/entities/google-calendar-event'
import { Injectable } from '@nestjs/common'
import { PrismaCalendarEventMapper } from '../../mappers/prisma-calendar-event-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCalendarEventRepository implements GoogleCalendarEventRepository {
  constructor(private prisma: PrismaService) {}

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

    return PrismaCalendarEventMapper.toDomain(calendarEvent)
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

    return PrismaCalendarEventMapper.toDomain(calendarEvent)
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
  ): Promise<{ id: string; htmlLink: string }> {
    const data = PrismaCalendarEventMapper.toPrisma(calendarEvent)

    const createdEvent = await this.prisma.calendarEvent.create({
      data,
    })

    return { id: createdEvent.id, htmlLink: createdEvent.googleEventLink }
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
