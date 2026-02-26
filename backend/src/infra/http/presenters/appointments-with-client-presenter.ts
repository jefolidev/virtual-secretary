import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'
import { EvaluationPresenter } from './evaluation-presenter'
import { RemindersPresenter } from './reminders-presenter'

export class AppointmentWithClientPresenter {
  static toHTTP(data: AppointmentWithClient) {
    return {
      appointment: {
        id: data.appointment.id.toString(),
        professionalId: data.appointment.professionalId.toString(),
        clientId: data.appointment.clientId.toString(),
        modality: data.appointment.modality,
        googleMeetLink: data.appointment.googleMeetLink ?? null,
        rescheduleDateTime: data.appointment.rescheduleDateTime ?? null,
        status: data.appointment.status,
        evaluation: data.appointment.evaluation
          ? EvaluationPresenter.toHTTP(data.appointment.evaluation)
          : null,
        agreedPrice: data.appointment.agreedPrice,
        paymentStatus: data.appointment.paymentStatus,
        paymentExpiresAt: data.appointment.paymentExpiresAt ?? null,
        currentTransactionId: data.appointment.currentTransactionId ?? null,
        startDateTime: data.appointment.startDateTime,
        endDateTime: data.appointment.endDateTime,
        reminders: data.appointment.reminders
          ? data.appointment.reminders.map(RemindersPresenter.toHTTP)
          : null,
        startedAt: data.appointment.startedAt ?? null,
        totalElapsedMs: data.appointment.totalElapsedMs ?? null,
        createdAt: data.appointment.createdAt,
        updatedAt: data.appointment.updatedAt,
      },
      client: {
        extraPreference: data.extraPreference ?? null,
        periodPreference: data.periodPreference ?? null,
      },
      address: data.address,
      notification: data.notification,
      name: data.name,
      whatsappNumber: data.whatsappNumber,
      email: data.email,
      cpf: data.cpf,
      gender: data.gender,
    }
  }
}
