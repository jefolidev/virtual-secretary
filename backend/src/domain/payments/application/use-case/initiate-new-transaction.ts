import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { Injectable } from '@nestjs/common'
import { ClientRepository } from '../../../scheduling/application/repositories/client.repository'
import {
  type PaymentMethod,
  Transaction,
} from '../../enterprise/entities/transaction'
import { PaymentGateway } from '../gateway/payment-gateway'
import { MercadoPagoTokenRepository } from '../repositories/mercado-pago-token.repository'
import { TransactionRepository } from '../repositories/transaction.repository'
import { InvalidAmountError } from './errors/invalid-amount'

export interface InitiateNewTransactionUseCaseRequest {
  appointmentId: string
  clientId: string
  amount: number
  paymentMethod: PaymentMethod
  payerEmail: string
}

export type InitiateNewTransactionUseCaseResponse = Either<
  NotAllowedError | NotFoundError | InvalidAmountError,
  { transactionId: string; method: PaymentMethod; checkoutUrl: string }
>

@Injectable()
export class InitiateNewTransactionUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clientRepository: ClientRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly mercadoPagoTokenRepository: MercadoPagoTokenRepository,
  ) {}

  async execute({
    amount,
    appointmentId,
    clientId,
    paymentMethod,
    payerEmail,
  }: InitiateNewTransactionUseCaseRequest): Promise<InitiateNewTransactionUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) return left(new NotFoundError('Appointment not found.'))

    const client = await this.clientRepository.findById(clientId)
    if (!client) return left(new NotFoundError('Client not found.'))

    if (appointment.clientId.toString() !== client.id.toString())
      return left(new NotAllowedError())

    if (!amount || amount <= 0)
      return left(
        new InvalidAmountError('Current transaction amount is invalid.'),
      )

    const paymentMethodIdMap = {
      PIX: 'pix',
      CREDIT_CARD: 'credit_card',
      DEBIT_CARD: 'debit_card',
    } as const

    const professionalToken =
      await this.mercadoPagoTokenRepository.findByProfessionalId(
        appointment.professionalId.toString(),
      )

    const { preferenceId, checkoutUrl } =
      await this.paymentGateway.createPreference({
        externalReference: appointmentId,
        title: 'Consulta',
        amount,
        payerEmail,
        paymentMethodId: paymentMethodIdMap[paymentMethod],
        professionalAccessToken: professionalToken?.accessToken ?? undefined,
      })

    const transaction = Transaction.create({
      appointmentId: new UniqueEntityId(appointmentId),
      clientId: new UniqueEntityId(clientId),
      method: paymentMethod,
      amount,
      feeAmount: 0,
      providerPaymentId: preferenceId,
      providerStatus: 'pending',
      providerStatusDetail: '',
      externalReference: appointmentId,
      lastFourDigits: null,
      cardBrand: null,
      installments: null,
      failureReason: null,
      metadata: {},
    })

    await this.transactionRepository.create(transaction)

    return right({
      transactionId: transaction.id.toString(),
      method: paymentMethod,
      checkoutUrl,
    })
  }
}
