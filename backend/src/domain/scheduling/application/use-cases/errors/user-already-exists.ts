import type { UseCaseError } from '@/core/errors/use-case-error'

export class UserAlreadyExists extends Error implements UseCaseError {
  constructor(message: string = 'User with this credentials already exists.') {
    super(message)
  }
}
