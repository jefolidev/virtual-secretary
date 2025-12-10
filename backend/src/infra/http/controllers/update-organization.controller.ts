import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { UpdateOrganizationUseCase } from '@/domain/organization/application/use-cases/update-organization'
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { OrganizationPresenter } from '../presenters/organization-presenter'
import {
  UpdateOrganizationBodySchema,
  updateOrganizationBodySchema,
} from './dto/update-organization.dto'

@Controller('/organization')
export class UpdateOrganizationController {
  constructor(
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase
  ) {}

  @Put('/:id')
  async handle(
    @Body(new ZodValidationPipe(updateOrganizationBodySchema))
    body: UpdateOrganizationBodySchema,
    @Param('id') organizationId: string
  ) {
    const { name } = body
    const result = await this.updateOrganizationUseCase.execute({
      name,
      organizationId,
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
