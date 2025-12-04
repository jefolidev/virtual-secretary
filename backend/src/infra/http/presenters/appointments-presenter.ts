import { Appointment } from '@/domain/scheduling/enterprise/entities/appointment'

export class AppointmentsPresenter {
  static toHTTP(appointment: Appointment) {
    return {
      id: appointment.id.toString(),
      professionalId: appointment.professionalId.toString(),
      clientId: appointment.clientId.toString(),
      startDateTime: appointment.startDateTime,
      endDateTime: appointment.endDateTime,
      modality: appointment.modality,
      rescheduleDateTime: appointment.rescheduleDateTime,
      agreedPrice: appointment.agreedPrice,
      googleMeetLink: appointment.googleMeetLink,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }
  }
}
