import type { UseCaseError } from '@/core/errors/use-case-error'

export class UserAreProfessionalError extends Error implements UseCaseError {
  constructor() {
    super('This user is a professional.')
  }
}
