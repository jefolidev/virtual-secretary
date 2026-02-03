import { CalendarEventRepository } from '@/domain/scheduling/application/repositories/google-calendar-event.repository'
import { CalendarEvent } from '@/domain/scheduling/enterprise/entities/google-calendar-event'
import { Injectable } from '@nestjs/common'
import { PrismaCalendarEventMapper } from '../mappers/prisma-calendar-event-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCalendarEventRepository implements CalendarEventRepository {
  constructor(private prisma: PrismaService) {}

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<CalendarEvent | null> {
    const calendarEvent = await this.prisma.calendarEvent.findUnique({
      where: { appointmentId },
    })

    if (!calendarEvent) {
      return null
    }

    return PrismaCalendarEventMapper.toDomain(calendarEvent)
  }

  async findByGoogleEventId(
    googleEventId: string,
  ): Promise<CalendarEvent | null> {
    const calendarEvent = await this.prisma.calendarEvent.findFirst({
      where: { googleEventId },
    })

    if (!calendarEvent) {
      return null
    }

    return PrismaCalendarEventMapper.toDomain(calendarEvent)
  }

  async findManyByProfessionalId(
    professionalId: string,
  ): Promise<CalendarEvent[]> {
    const calendarEvents = await this.prisma.calendarEvent.findMany({
      where: { professionalId },
      orderBy: { startDateTime: 'asc' },
    })

    return calendarEvents.map(PrismaCalendarEventMapper.toDomain)
  }

  async create(calendarEvent: CalendarEvent): Promise<void> {
    const data = PrismaCalendarEventMapper.toPrisma(calendarEvent)

    await this.prisma.calendarEvent.create({
      data,
    })
  }

  async save(calendarEvent: CalendarEvent): Promise<void> {
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
