import type { UseCaseError } from '@src/core/errors/use-case-error'

export class NotFoundError extends Error implements UseCaseError {
  constructor(message = 'Resourece not founded.') {
    super(message)
  }
}
