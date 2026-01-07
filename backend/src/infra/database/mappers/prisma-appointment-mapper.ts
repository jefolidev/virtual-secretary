import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Appointment } from '@/domain/scheduling/enterprise/entities/appointment'
import { Appointment as PrismaAppointment } from '@prisma/generated/client'
import { AppointmentUncheckedCreateInput } from '@prisma/generated/models'

export class PrismaAppointmentMapper {
  static toPrisma(raw: Appointment): AppointmentUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      clientId: raw.clientId.toString(),
      professionalId: raw.professionalId.toString(),
      agreedPrice: raw.agreedPrice,
      endDateTime: raw.endDateTime,
      googleMeetLink: raw.googleMeetLink,
      modality: raw.modality,
      rescheduleDateTime: raw.rescheduleDateTime,
      startDateTime: raw.startDateTime,
      status: raw.status,
      paymentStatus: raw.paymentStatus,
      startedAt: raw.startedAt,
      totalElapsedMs: raw.totalElapsedMs ? BigInt(raw.totalElapsedMs) : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  static toDomain(raw: PrismaAppointment): Appointment {
    if (!raw.clientId) {
      throw new Error('Invalid client id.')
    }

    // Parse rescheduleDateTime from JSON if present
    let rescheduleDateTime: { start: Date; end: Date } | undefined
    if (raw.rescheduleDateTime) {
      const parsed = raw.rescheduleDateTime as { start: string; end: string }
      rescheduleDateTime = {
        start: new Date(parsed.start),
        end: new Date(parsed.end),
      }
    }

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
        rescheduleDateTime,
        status: raw.status,
        paymentStatus: raw.paymentStatus as any,
        startedAt: raw.startedAt,
        totalElapsedMs: raw.totalElapsedMs ? Number(raw.totalElapsedMs) : null,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
