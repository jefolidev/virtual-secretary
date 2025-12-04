import type { UseCaseError } from '@/core/errors/use-case-error'

export class BadRequestError extends Error implements UseCaseError {
  constructor(message = 'Bad Request') {
    super(message)
  }
}
