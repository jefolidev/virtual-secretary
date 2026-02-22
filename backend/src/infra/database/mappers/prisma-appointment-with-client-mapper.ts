import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'
import {
  Address as PrismaAddress,
  Appointment as PrismaAppointment,
  Client as PrismaClient,
  Notification as PrismaNotification,
  User as PrismaUser
} from '@prisma/client'
import { PrismaAddressMapper } from './prisma-address-mapper'
import { PrismaAppointmentMapper } from './prisma-appointment-mapper'
import { PrismaNotificationMapper } from './prisma-notification-mapper'

type PrismaAppointmentWithClient = PrismaAppointment & {
  client: PrismaClient & {
    user:
      | (PrismaUser & {
          address: PrismaAddress | null
          notifications: PrismaNotification[]
        })
      | null
  }
}

export class PrismaAppointmentWithClientMapper {
  static toDomain(raw: PrismaAppointmentWithClient): AppointmentWithClient {
    if (!raw.client) {
      throw new Error(`Client data is missing for appointment ${raw.id}.`)
    }

    if (!raw.client.user) {
      throw new Error(
        `User data is missing for appointment ${raw.id} (client ${raw.client.id}).`,
      )
    }

    if (!raw.client.user.address) {
      throw new Error(
        `Address data is missing for user ${raw.client.user.id} (client ${raw.client.id}, appointment ${raw.id}).`,
      )
    }

    return AppointmentWithClient.create({
      appointment: PrismaAppointmentMapper.toDomain(raw),
      client: {
        extraPreference: raw.client.extraPreference,
        periodPreference: raw.client.periodPreference,
      },

      address: PrismaAddressMapper.toDomain(raw.client.user.address),
      notification: raw.client.user.notifications.map(
        PrismaNotificationMapper.toDomain,
      ),

      name: raw.client.user.name,
      whatsappNumber: raw.client.user.whatsappNumber,
      email: raw.client.user.email,
      cpf: raw.client.user.cpf,
      gender: raw.client.user.gender,
    })
  }
}
