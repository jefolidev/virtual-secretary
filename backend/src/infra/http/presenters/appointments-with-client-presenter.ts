import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'

export class AppointmentWithClientPresenter {
  static toHTTP(data: AppointmentWithClient) {
    return {
      appointments: {
        id: data.appointment.id.toString(),
        professionalId: data.appointment.professionalId.toString(),
        clientId: data.appointment.clientId.toString(),
        modality: data.appointment.modality,
        googleMeetLink: data.appointment.googleMeetLink,
        rescheduleDateTime: data.appointment.rescheduleDateTime,
        status: data.appointment.status,

        agreedPrice: data.appointment.agreedPrice,
        paymentStatus: data.appointment.paymentStatus,
        paymentExpiresAt: data.appointment.paymentExpiresAt,
        currentTransactionId: data.appointment.currentTransactionId,

        startDateTime: data.appointment.startDateTime,
        endDateTime: data.appointment.endDateTime,

        startedAt: data.appointment.startedAt,
        totalElapsedMs: data.appointment.totalElapsedMs,
        createdAt: data.appointment.createdAt,
        updatedAt: data.appointment.updatedAt,
      },

      client: {
        extraPreference: data.extraPreference,
        periodPreference: data.periodPreference,
      },

      address: data.address,
      notifications: data.notification,

      name: data.name,
      whatsappNumber: data.whatsappNumber,
      email: data.email,
      cpf: data.cpf,
      gender: data.gender,
    }
  }
}
