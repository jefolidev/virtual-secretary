import type { UseCaseError } from '@/core/errors/use-case-error'

export class ProfessionalAlreadyInOrganizationError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('This professional is already in this organization.')
  }
}
