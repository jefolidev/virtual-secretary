import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { FetchScheduleByProfesionalIdFilters } from '@/domain/scheduling/application/use-cases/fetch-schedule-by-professional-id'
import {
  Appointment,
  AppointmentModalityType,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'
import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'
import { InjectQueue } from '@nestjs/bullmq'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Queue } from 'bullmq'
import dayjs from 'dayjs'
import { PrismaAppointmentMapper } from '../../mappers/prisma-appointment-mapper'
import { PrismaAppointmentWithClientMapper } from '../../mappers/prisma-appointment-with-client-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAppointmentsRepository implements AppointmentsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('whatsapp-reminders') private remindersQueue: Queue,
  ) {}

  async create(appointment: Appointment): Promise<void> {
    const data = PrismaAppointmentMapper.toPrisma(appointment)

    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "professionals" WHERE id = ${data.professionalId} FOR UPDATE`

      const overlapping = await tx.appointment.findFirst({
        where: {
          professionalId: data.professionalId,
          OR: [
            {
              startDateTime: { lte: data.startDateTime },
              endDateTime: { gt: data.startDateTime },
            },
            {
              startDateTime: { lt: data.endDateTime },
              endDateTime: { gte: data.endDateTime },
            },
            {
              startDateTime: { gte: data.startDateTime },
              endDateTime: { lte: data.endDateTime },
            },
          ],
        },
      })

      if (overlapping) {
        throw new BadRequestException('Este horário já está ocupado.')
      }

      const consultationTime = new Date(data.startDateTime).getTime()

      let delay24h = consultationTime - 24 * 60 * 60 * 1000 - Date.now()
      if (delay24h <= 0) {
        delay24h = 0
      }

      await this.remindersQueue.add(
        'send-24h-reminder',
        {
          appointmentId: appointment.id.toString(),
        },
        {
          delay: delay24h,
        },
      )

      const delayTimeout = consultationTime - 12 * 60 * 60 * 1000 - Date.now()
      await this.remindersQueue.add(
        'auto-cancel-timeout',
        {
          appointmentId: appointment.id.toString(),
        },
        {
          delay: delayTimeout,
        },
      )

      await tx.appointment.create({
        data: {
          ...data,
          rescheduleDateTime: JSON.stringify(data.rescheduleDateTime),
        },
      })
    })

    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }

  async scheduleFromRawData({
    whatsappNumber,
    professionalName,
    startDateTime,
    modality,
  }: {
    whatsappNumber: string
    professionalName: string
    startDateTime: Date
    modality: string
  }) {
    const user = await this.prisma.user.findFirst({
      where: { whatsappNumber },
      include: { client: true }, // Traz o cliente vinculado automaticamente
    })

    if (!user || !user.client) {
      throw new NotFoundException(
        'Cliente não encontrado ou cadastro incompleto.',
      )
    }

    // O ID que o Appointment precisa é o do CLIENTE
    const clientId = user.client.id

    // 2. Busca o Profissional (Mesma lógica de busca do User primeiro)
    const professionalUser = await this.prisma.user.findFirst({
      where: { name: { contains: professionalName, mode: 'insensitive' } },
      include: { professional: true },
    })

    if (!professionalUser || !professionalUser.professional) {
      throw new NotFoundException('Profissional não encontrado.')
    }

    const professionalId = professionalUser.professional.id
    const prismaProfessional = await this.prisma.professional.findFirst({
      where: { user: { id: professionalUser.id } },
    })

    if (!prismaProfessional)
      throw new NotFoundException('Profissional não encontrado.')

    // 3. Busca Configurações de Agenda
    const config = await this.prisma.scheduleConfiguration.findUnique({
      where: { professionalId: prismaProfessional.id },
    })

    if (!config)
      throw new NotFoundException('Configuração de agenda não encontrada.')

    // 4. Lógica de Horários
    const start = dayjs(startDateTime)
    const endDateTime = start
      .add(config.sessionDurationMinutes, 'minutes')
      .toDate()

    // 5. Regra: 3 horas de antecedência
    if (start.diff(dayjs(), 'hour', true) < 3) {
      throw new BadRequestException(
        'Agendamentos devem ter 3h de antecedência.',
      )
    }

    // 6. Regra: Sobreposição (Overlapping) direto no Prisma
    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        professionalId: prismaProfessional.id,
        OR: [
          {
            startDateTime: { lte: startDateTime },
            endDateTime: { gt: startDateTime },
          },
          {
            startDateTime: { lt: endDateTime },
            endDateTime: { gte: endDateTime },
          },
        ],
      },
    })

    if (overlapping) {
      throw new BadRequestException('Este horário já está ocupado.')
    }

    // 7. Instancia a Entidade de Domínio para manter a validade do agendamento
    await this.prisma.appointment.create({
      data: {
        clientId: clientId, // Agora usando o ID correto da tabela Client
        professionalId: professionalId, // Usando o ID da tabela Professional
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        modality: modality.toUpperCase() as AppointmentModalityType,
        agreedPrice: professionalUser.professional.sessionPrice,
        status: 'SCHEDULED',
      },
    })
  }

  async findByGoogleEventId(
    googleEventId: string,
  ): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { calendarEvent: { googleEventId } },
    })

    if (!appointment) {
      return null
    }

    return PrismaAppointmentMapper.toDomain(appointment)
  }

  async findMany(params: { page: number }): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      take: 10,
      skip: params?.page ? (params.page - 1) * 10 : 0,
    })

    if (appointments.length === 0) {
      return []
    }

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
      },
    })

    if (!appointment) {
      return null
    }

    return PrismaAppointmentMapper.toDomain(appointment)
  }

  async findOverlapping(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        professionalId,
      },
    })

    if (appointments.length === 0) {
      return []
    }

    const domainAppointments = appointments.map(
      PrismaAppointmentMapper.toDomain,
    )

    const blockingStatuses = [
      'SCHEDULED',
      'CONFIRMED',
      'RESCHEDULED',
      'IN_PROGRESS',
    ]

    const overlappingAppointments = domainAppointments.filter((appointment) => {
      if (!blockingStatuses.includes(appointment.status)) {
        return false
      }

      const effectiveStart = appointment.effectiveStartDateTime
      const effectiveEnd = appointment.effectiveEndDateTime

      return effectiveStart < endDate && effectiveEnd > startDate
    })

    return overlappingAppointments
  }

  async findManyByProfessionalId(
    professionalId: string,
    params: PaginationParams,
    filters: FetchScheduleByProfesionalIdFilters = {
      modality: 'all',
      paymentStatus: 'all',
      period: 'all',
      status: 'all',
    },
  ): Promise<AppointmentWithClient[]> {
    const { modality, paymentStatus, period, status: filterStatus } = filters
    const page = Number(params?.page) > 0 ? Number(params.page) : 1

    const appointments = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        client: {
          is: {
            user: {
              addressId: { not: null },
            },
          },
        },
        ...(period === 'last-month'
          ? {
              createdAt: {
                gte: dayjs().subtract(1, 'month').toDate(),
                lte: new Date(),
              },
            }
          : period === 'last-year'
            ? {
                createdAt: {
                  gte: dayjs().subtract(1, 'year').toDate(),
                  lte: new Date(),
                },
              }
            : period === 'last-week'
              ? {
                  createdAt: {
                    gte: dayjs().subtract(1, 'week').toDate(),
                    lte: new Date(),
                  },
                }
              : undefined),
        ...(filterStatus && {
          status: filterStatus === 'all' ? undefined : filterStatus,
        }),
        ...(modality && {
          modality: modality === 'all' ? undefined : modality,
        }),
        ...(paymentStatus && {
          paymentStatus: paymentStatus === 'all' ? undefined : paymentStatus,
        }),
      },
      include: {
        evaluation: true,
        client: {
          include: {
            user: {
              include: {
                address: true,
                notifications: true,
              },
            },
          },
        },
      },
      take: 5,
      skip: Math.max(0, (page - 1) * 5),
    })

    const appointmentsWithUser = appointments.filter(
      (a) => a.client && a.client.user,
    )

    if (appointmentsWithUser.length !== appointments.length) {
      const missingIds = appointments
        .filter((a) => !a.client || !a.client.user)
        .map((a) => a.id)
      console.warn(
        `PrismaAppointmentsRepository.findManyByProfessionalId: ${missingIds.length} appointment(s) missing client.user: ${missingIds.join(', ')}`,
      )
    }

    return appointmentsWithUser.map((raw) =>
      PrismaAppointmentWithClientMapper.toDomain(raw),
    )
  }

  async countAppointmentsByProfessionalId(
    professionalId: string,
    filters: FetchScheduleByProfesionalIdFilters = {
      modality: 'all',
      paymentStatus: 'all',
      period: 'all',
      status: 'all',
    },
  ): Promise<number> {
    const { modality, paymentStatus, period, status: filterStatus } = filters

    const where: any = {
      professionalId,
      client: {
        is: {
          user: {
            addressId: { not: null },
          },
        },
      },
      ...(period === 'last-month'
        ? {
            createdAt: {
              gte: dayjs().subtract(1, 'month').toDate(),
              lte: new Date(),
            },
          }
        : period === 'last-year'
          ? {
              createdAt: {
                gte: dayjs().subtract(1, 'year').toDate(),
                lte: new Date(),
              },
            }
          : period === 'last-week'
            ? {
                createdAt: {
                  gte: dayjs().subtract(1, 'week').toDate(),
                  lte: new Date(),
                },
              }
            : undefined),
      ...(filterStatus &&
        (filterStatus === 'all' ? undefined : { status: filterStatus })),
      ...(modality && (modality === 'all' ? undefined : { modality })),
      ...(paymentStatus &&
        (paymentStatus === 'all' ? undefined : { paymentStatus })),
    }

    return this.prisma.appointment.count({ where })
  }

  async findManyByClientId(
    clientId: string,
    params: { page: number },
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clientId,
      },
      take: 10,
      skip: params.page ? (params.page - 1) * 10 : 0,
    })

    if (appointments.length === 0) {
      return []
    }

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        startDateTime: startDate,
        endDateTime: endDate,
      },
    })

    if (appointments.length === 0) {
      return []
    }

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async findManyByStatus(
    status: AppointmentStatusType,
    params: { page: number },
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status,
      },
      take: 10,
      skip: params.page ? (params.page - 1) * 10 : 0,
    })

    if (appointments.length === 0) {
      return []
    }

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async save(appointment: Appointment): Promise<void> {
    const data = PrismaAppointmentMapper.toPrisma(appointment)

    await Promise.all([
      this.prisma.appointment.update({
        where: {
          id: appointment.id.toString(),
        },
        data: {
          ...data,
          rescheduleDateTime: data.rescheduleDateTime ?? Prisma.JsonNull,
        },
      }),
    ])

    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }
}
