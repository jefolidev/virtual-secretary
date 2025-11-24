import type { UseCaseError } from '@src/core/errors/use-case-error'

export class NegativeValueError extends Error implements UseCaseError {
  constructor() {
    super('Not accept negative values')
  }
}
