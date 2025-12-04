import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Appointment,
  AppointmentStatusType,
} from '@/domain/scheduling/enterprise/entities/appointment'
import { Appointment as PrismaAppointment } from '@prisma/generated/client'
import { AppointmentUncheckedCreateInput } from '@prisma/generated/models'

export class PrismaAppointmentMapper {
  static toPrisma({
    agreedPrice,
    clientId,
    createdAt,
    endDateTime,
    googleMeetLink,
    id,
    modality,
    rescheduleDateTime,
    startDateTime,
    professionalId,
    updatedAt,
  }: Appointment): AppointmentUncheckedCreateInput {
    return {
      agreedPrice,
      clientId: clientId.toString(),
      createdAt,
      endDateTime,
      googleMeetLink,
      id: id.toString(),
      modality,
      rescheduleDateTime,
      professionalId: professionalId.toString(),
      startDateTime,
      updatedAt,
    }
  }

  static toDomain(raw: PrismaAppointment): Appointment {
    return Appointment.create(
      {
        agreedPrice: Number(raw.agreedPrice),
        endDateTime: raw.endDateTime,
        clientId: new UniqueEntityId(raw.clientId),
        modality: raw.modality,
        professionalId: new UniqueEntityId(raw.professionalId),
        startDateTime: raw.startDateTime,
        createdAt: raw.createdAt,
        googleMeetLink: raw.googleMeetLink || undefined,
        rescheduleDateTime: {
          start: raw.startDateTime,
          end: raw.endDateTime,
        },
        status: raw.status as AppointmentStatusType,
        updatedAt: raw.updatedAt,
        amount: 0,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
