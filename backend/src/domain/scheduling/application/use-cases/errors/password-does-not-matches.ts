import type { UseCaseError } from '@/core/errors/use-case-error'

export class PasswordDoesntMatchesError extends Error implements UseCaseError {
  constructor(message = "Password doesn't matches, try again.") {
    super(message)
  }
}
