import type { UseCaseError } from '@/core/errors/use-case-error'

export class NoDisponibilityError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message)
  }
}
