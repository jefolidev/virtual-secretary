import type { UseCaseError } from '@/core/errors/use-case-error'

export class ProfessionalNotInOrganizationError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('This professional is not in this organization.')
  }
}
