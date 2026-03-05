import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { FetchTransactionByAppointmentIdUseCase } from '@/domain/payments/application/use-case/fetch-transaction-by-appointment-id'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { TransactionPresenter } from '../presenters/transaction-presenter'

@Controller('/appointments/:id/transaction')
export class FetchTransactionByAppointmentController {
  constructor(
    private readonly fetchTransaction: FetchTransactionByAppointmentIdUseCase,
  ) {}

  @Get()
  async handle(@Param('id') appointmentId: string) {
    const result = await this.fetchTransaction.execute({ appointmentId })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    return {
      transaction: TransactionPresenter.toHTTP(result.value.transaction),
    }
  }
}
