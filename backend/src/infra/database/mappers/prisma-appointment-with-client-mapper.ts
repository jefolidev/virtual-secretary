import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'
import {
  Appointment as PrismaAppointment,
  Client as PrismaClient,
  User as PrismaUser,
} from '@prisma/client'
import { PrismaAppointmentMapper } from './prisma-appointment-mapper'

type PrismaAppointmentWithClient = PrismaAppointment & {
  client: PrismaClient & {
    users: PrismaUser | null
  }
}

export class PrismaAppointmentWithClientMapper {
  static toDomain(raw: PrismaAppointmentWithClient): AppointmentWithClient {
    if (!raw.client.users) {
      throw new Error('User data is missing for this appointment.')
    }

    return AppointmentWithClient.create({
      appointment: PrismaAppointmentMapper.toDomain(raw),
      extraPreference: raw.client.extraPreference,
      periodPreference: raw.client.periodPreference,
      name: raw.client.users.name,
      whatsappNumber: raw.client.users.whatsappNumber,
      email: raw.client.users.email,
      cpf: raw.client.users.cpf,
      gender: raw.client.users.gender,
    })
  }
}
