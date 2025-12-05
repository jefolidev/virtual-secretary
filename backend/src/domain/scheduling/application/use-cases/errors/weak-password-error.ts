import { UseCaseError } from '@/core/errors/use-case-error'

export class WeakPasswordError extends Error implements UseCaseError {
  public readonly errors: string[]

  constructor(errors: string[]) {
    super('Password is too weak.')
    this.name = 'WeakPasswordError'
    this.errors = errors
    Object.setPrototypeOf(this, WeakPasswordError.prototype)
  }
}
