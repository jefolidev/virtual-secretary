import type { UseCaseError } from '@/core/errors/use-case-error'

export class AppointmentIsntAwaitingCommentError
  extends Error
  implements UseCaseError
{
  constructor(message = 'Appointment is not awaiting comment') {
    super(message)
  }
}
