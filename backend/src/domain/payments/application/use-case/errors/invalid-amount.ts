import type { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidAmountError extends Error implements UseCaseError {
  constructor(message = 'Amount invalid.') {
    super(message)
  }
}
