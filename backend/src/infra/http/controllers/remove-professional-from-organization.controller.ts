import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { RemoveProfessionalFromOrganizationUseCase } from '@/domain/organization/application/use-cases/remove-professional-from-organization'
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { OrganizationPresenter } from '../presenters/organization-presenter'
import {
  RemoveProfessionalFromOrganizationBodySchema,
  removeProfessionalFromOrganizationBodySchema,
} from './dto/remove-professional-from-organization.dto'

@Controller('/organization/:id')
export class RemoveProfessionalFromOrganizationController {
  constructor(
    private readonly removeProfessionalFromOrganizationUseCase: RemoveProfessionalFromOrganizationUseCase
  ) {}

  @Patch('/remove/professional')
  async handle(
    @Body(new ZodValidationPipe(removeProfessionalFromOrganizationBodySchema))
    body: RemoveProfessionalFromOrganizationBodySchema,
    @Param('id') organizationId: string
  ) {
    const { professionalId } = body
    const result = await this.removeProfessionalFromOrganizationUseCase.execute(
      {
        organizationId,
        professionalId,
      }
    )

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const organization = result.value.organization

    return {
      organizations: OrganizationPresenter.toHTTP(organization),
    }
  }
}
