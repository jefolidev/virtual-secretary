import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Transaction } from '../../enterprise/entities/transaction'
import { TransactionRepository } from '../repositories/transaction.repository'

export interface FetchTransactionByAppointmentIdUseCaseRequest {
  appointmentId: string
}

export type FetchTransactionByAppointmentIdUseCaseResponse = Either<
  NotFoundError,
  { transaction: Transaction }
>

@Injectable()
export class FetchTransactionByAppointmentIdUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute({
    appointmentId,
  }: FetchTransactionByAppointmentIdUseCaseRequest): Promise<FetchTransactionByAppointmentIdUseCaseResponse> {
    const transaction =
      await this.transactionRepository.findByAppointmentId(appointmentId)

    if (!transaction) {
      return left(new NotFoundError('Transaction not found.'))
    }

    return right({ transaction })
  }
}
