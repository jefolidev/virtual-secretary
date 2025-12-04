import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import {
  Appointment,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'
import { Injectable } from '@nestjs/common'
import { PrismaAppointmentMapper } from '../../mappers/prisma-appointment-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAppointmentsRepository implements AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(appointment: Appointment): Promise<void> {
    const data = PrismaAppointmentMapper.toPrisma(appointment)

    await this.prisma.appointment.create({
      data,
    })
  }
  async findMany(): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany()
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

  async findByProfessionalId(
    professionalId: string
  ): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
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
    endDate: Date
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        startDateTime: { lt: endDate },
        endDateTime: { gt: startDate },
      },
    })
    if (appointments.length === 0) {
      return []
    }

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async findManyByProfessionalId(
    professionalId: string
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        professionalId,
      },
    })

    if (appointments.length === 0) {
      return []
    }

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async findManyByClientId(clientId: string): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clientId,
      },
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
    status: AppointmentStatusType
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status,
      },
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
        data,
      }),
    ])
  }
}
