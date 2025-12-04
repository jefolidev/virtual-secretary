import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import {
  Appointment,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'
import { Injectable } from '@nestjs/common'
import { PrismaAppointmentMapper } from '../../mappers/prisma-appointment-mapper'
import { PrismaService } from '../prisma.service'

@Injectable({})
export class PrismaAppointmentsRepository implements AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(appointment: Appointment): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id,
      },
    })

    if (!appointment) {
      return null
    }

    return PrismaAppointmentMapper.toDomain(appointment)
  }
  findByProfessionalId(professionalId: string): Promise<Appointment[] | null> {
    throw new Error('Method not implemented.')
  }
  findOverlapping(
    profissionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findManyByProfessionalId(professionalId: string): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findManyByClientId(clientId: string): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  findManyByDate(startDate: Date, endDate: Date): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
  save(appointment: Appointment): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findManyByStatus(status: AppointmentStatusType): Promise<Appointment[]> {
    throw new Error('Method not implemented.')
  }
}
