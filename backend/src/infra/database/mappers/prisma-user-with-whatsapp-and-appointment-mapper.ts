import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Appointment,
  PaymentStatus,
} from '@/domain/scheduling/enterprise/entities/appointment'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { UserClientWhatsappAppointments } from '@/domain/scheduling/enterprise/entities/value-objects/user-with-clients-and-appointments'
import { WhatsappContact } from '@/domain/scheduling/enterprise/entities/whatsapp-contact'
import {
  Appointment as PrismaAppointment,
  Client as PrismaClient,
  User as PrismaUser,
  WhatsappContact as PrismaWhatsappContact,
} from '@prisma/client'

type PrismaUserWithWhatsappAndAppointment = PrismaUser & {
  whatsappContact: PrismaWhatsappContact | null
  client: (PrismaClient & { appointments: PrismaAppointment[] }) | null
}

export class PrismaUserWithWhatsappAndAppointmentMapper {
  static toDomain(
    raw: PrismaUserWithWhatsappAndAppointment,
  ): UserClientWhatsappAppointments {
    const user = User.create(
      {
        name: raw.name,
        email: raw.email,
        cpf: raw.cpf,
        birthDate: raw.birthDate,
        gender: raw.gender,
        role: raw.role,
        whatsappNumber: raw.whatsappNumber,
        password: '',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )

    const client = Client.create(
      {
        appointmentHistory: [],
        createdAt: raw.client?.createdAt,
        extraPreferences: raw.client?.extraPreference,
        periodPreference: raw.client?.periodPreference,
      },
      raw.client?.id ? new UniqueEntityId(raw.client.id) : undefined,
    )

    const whatsappContact = WhatsappContact.create(
      {
        nickName: raw.whatsappContact?.nickName || '',
        phone: raw.whatsappContact?.phone || '',
        profilePicUrl: raw.whatsappContact?.profilePicUrl,
        lastSeen: raw.whatsappContact?.lastSeen,
        isRegistred: raw.whatsappContact?.isRegistred || false,
      },
      raw.whatsappContact?.id
        ? new UniqueEntityId(raw.whatsappContact.id)
        : undefined,
    )

    const appointmentsSource = raw.client?.appointments || []

    const appointments = appointmentsSource.map((a) => {
      return Appointment.create({
        clientId: a.clientId
          ? new UniqueEntityId(a.clientId)
          : (undefined as any),
        professionalId: a.professionalId
          ? new UniqueEntityId(a.professionalId)
          : (undefined as any),
        startDateTime: a.startDateTime,
        evaluation: undefined,
        endDateTime: a.endDateTime,
        modality: a.modality as any,
        agreedPrice: Number(a.agreedPrice) ?? 0,
        status: a.status as any,
        paymentStatus: a.paymentStatus as PaymentStatus,

        googleMeetLink: a.googleMeetLink || null,

        syncWithGoogleCalendar: a.syncWithGoogleCalendar || false,
        currentTransactionId: a.currentTransactionId || null,
        startedAt: a.startedAt || null,
        paymentExpiresAt: a.paymentExpiresAt || null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt || undefined,
      })
    })

    return UserClientWhatsappAppointments.create({
      id: user?.id,
      user,
      client: client,
      whatsappContact: whatsappContact,
      appointments: appointments,
    })
  }
}
