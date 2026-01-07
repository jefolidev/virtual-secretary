import { Appointment } from '@/domain/scheduling/enterprise/entities/appointment'

export class AppointmentsPresenter {
  static toHTTP(appointment: Appointment) {
    return {
      professional_id: appointment.professionalId.toString(),
      client_id: appointment.clientId.toString(),
      schedule_time: {
        start_hour: appointment.startDateTime,
        end_hour: appointment.endDateTime,
      },
      modality: appointment.modality,
      reschedule_time: appointment.rescheduleDateTime
        ? {
            start_hour: appointment.rescheduleDateTime.start,
            end_hour: appointment.rescheduleDateTime.end,
          }
        : {},
      agreed_price: appointment.agreedPrice,
      google_meet_link: appointment.googleMeetLink,
      status: appointment.status,
      started_at: appointment.startedAt,
      total_elapsed_ms: appointment.totalElapsedMs,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
    }
  }
}
