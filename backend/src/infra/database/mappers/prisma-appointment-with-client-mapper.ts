import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'
import {
  Address as PrismaAddress,
  Appointment as PrismaAppointment,
  Client as PrismaClient,
  Notification as PrismaNotification,
  User as PrismaUser,
} from '@prisma/client'
import { PrismaAddressMapper } from './prisma-address-mapper'
import { PrismaAppointmentMapper } from './prisma-appointment-mapper'
import { PrismaNotificationMapper } from './prisma-notification-mapper'

type PrismaAppointmentWithClient = PrismaAppointment & {
  client: PrismaClient & {
    users:
      | (PrismaUser & {
          address: PrismaAddress | null
          notifications: PrismaNotification[]
        })
      | null
  }
}

export class PrismaAppointmentWithClientMapper {
  static toDomain(raw: PrismaAppointmentWithClient): AppointmentWithClient {
    if (!raw.client.users) {
      throw new Error('User data is missing for this appointment.')
    }

    if (!raw.client.users.address) {
      throw new Error('Address data is missing for this appointment.')
    }

    return AppointmentWithClient.create({
      appointment: PrismaAppointmentMapper.toDomain(raw),
      client: {
        extraPreference: raw.client.extraPreference,
        periodPreference: raw.client.periodPreference,
      },

      address: PrismaAddressMapper.toDomain(raw.client.users.address),
      notification: raw.client.users.notifications.map(
        PrismaNotificationMapper.toDomain,
      ),

      name: raw.client.users.name,
      whatsappNumber: raw.client.users.whatsappNumber,
      email: raw.client.users.email,
      cpf: raw.client.users.cpf,
      gender: raw.client.users.gender,
    })
  }
}
