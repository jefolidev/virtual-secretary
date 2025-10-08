import type { UseCaseError } from '@/core/errors/use-case-error'

export class CannotCancelAppointmentError
  extends Error
  implements UseCaseError
{
  constructor(message: string = 'Cannot cancel this appointment.') {
    super(message)
  }
}
