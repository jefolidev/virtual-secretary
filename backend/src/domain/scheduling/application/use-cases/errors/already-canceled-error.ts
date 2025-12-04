import type { UseCaseError } from '@/core/errors/use-case-error'

export class AlreadyCanceledError extends Error implements UseCaseError {
  constructor() {
    super('This appointment has already been canceled.')
  }
}
