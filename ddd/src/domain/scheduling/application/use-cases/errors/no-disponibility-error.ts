import type { UseCaseError } from '@src/core/errors/use-case-error'

export class NoDisponibilityError extends Error implements UseCaseError {
  constructor(message: string = 'No disponibility') {
    super(message)
  }
}
