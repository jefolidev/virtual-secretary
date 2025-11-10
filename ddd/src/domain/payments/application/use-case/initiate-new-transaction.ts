import { faker } from '@faker-js/faker'
import { type Either, left, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { AppointmentsRepository } from '@src/domain/scheduling/application/repositories/appointments.repository'
import type { ClientRepository } from '../../../scheduling/application/repositories/client.repository'
import {
  type PaymentProvider,
  Transaction,
} from '../../enterprise/entities/transaction'
import type { TransactionRepository } from '../repositories/transaction.repository'
import { InvalidAmountError } from './errors/invalid-amount'

export interface InitiateNewTransactionUseCaseRequest {
  appointmentId: string
  clientId: string
  amount: number
  paymentProviderType: PaymentProvider
}

export type InitiateNewTransactionUseCaseResponse = Either<
  NotAllowedError | NotFoundError | InvalidAmountError,
  {
    transactionId: string
    paymentLinkUrl: string
  }
>

export class InitiateNewTransactionUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clientRepository: ClientRepository
  ) {}

  async execute({
    amount,
    appointmentId,
    clientId,
    paymentProviderType,
  }: InitiateNewTransactionUseCaseRequest): Promise<InitiateNewTransactionUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(
      new UniqueEntityId(appointmentId)
    )

    if (!appointment) return left(new NotFoundError('Appointment not found.'))

    const client = await this.clientRepository.findById(
      new UniqueEntityId(clientId)
    )

    if (!client) return left(new NotFoundError('Client not found.'))

    if (appointment?.clientId !== client.id) return left(new NotAllowedError())

    if (!amount || amount <= 0)
      return left(
        new InvalidAmountError('Curret transaction amount is invalid.')
      )

    const transaction = Transaction.create({
      amount,
      appointmentId: new UniqueEntityId(appointmentId),
      clientId: new UniqueEntityId(clientId),
      provider: paymentProviderType,
    })

    await this.transactionRepository.create(transaction)

    return right({
      transactionId: transaction.id.toString(),
      paymentLinkUrl: faker.internet.url(),
    })
  }
}
