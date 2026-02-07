import type { UseCaseError } from '@/core/errors/use-case-error'

export class NotConnectedError extends Error implements UseCaseError {
  constructor(message = "The professional's Google account is not connected.") {
    super(message)
  }
}
