import type { UseCaseError } from '@src/core/errors/use-case-error'

export class InvalidValueError extends Error implements UseCaseError {
  constructor(message: string = 'The current value is invalid.') {
    super(message)
  }
}
