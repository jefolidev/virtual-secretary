import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AddProfessionalToOrganizationUseCase } from '@/domain/organization/application/use-cases/add-professional-to-organization'
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
  AddProfessionalToOrganizationBodySchema,
  addProfessionalToOrganizationBodySchema,
} from './dto/add-professional-to-organization.dto'

@Controller('/organization/:id')
export class AddProfessionalToOrganizationController {
  constructor(
    private readonly addProfessionalToOrganizationUseCase: AddProfessionalToOrganizationUseCase
  ) {}

  @Patch('/add/professional')
  async handle(
    @Body(new ZodValidationPipe(addProfessionalToOrganizationBodySchema))
    body: AddProfessionalToOrganizationBodySchema,
    @Param('id') organizationId: string
  ) {
    const { professionalId } = body
    const result = await this.addProfessionalToOrganizationUseCase.execute({
      organizationId,
      professionalId,
    })

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
