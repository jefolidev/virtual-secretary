import { Reminders } from '@/domain/scheduling/enterprise/entities/reminders'

export class RemindersPresenter {
  static toHTTP(data: Reminders) {
    return {
      id: data.id.toString(),
      appointmentId: data.appointmentId.toString(),
      type: data.type,
      sentAt: data.sentAt,
    }
  }
}
