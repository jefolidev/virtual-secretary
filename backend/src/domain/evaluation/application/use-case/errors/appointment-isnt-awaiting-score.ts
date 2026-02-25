import type { UseCaseError } from '@/core/errors/use-case-error'

export class AppointmentIsntAwaitingScoreError
  extends Error
  implements UseCaseError
{
  constructor(message = 'Appointment is not awaiting score') {
    super(message)
  }
}
