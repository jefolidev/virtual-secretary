import type { UseCaseError } from '@src/core/errors/use-case-error'

export class ValidationError extends Error implements UseCaseError {
  constructor(message = 'Validation error') {
    super(message)
  }
}
