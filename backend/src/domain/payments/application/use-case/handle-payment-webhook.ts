import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { Injectable } from '@nestjs/common'
import { PaymentGateway } from '../gateway/payment-gateway'
import { TransactionRepository } from '../repositories/transaction.repository'

export interface HandlePaymentWebhookUseCaseRequest {
  providerPaymentId: string
  professionalAccessToken?: string
}

export type HandlePaymentWebhookUseCaseResponse = Either<
  NotFoundError,
  {
    appointmentId: string
    clientId: string
    professionalId: string
    amount: number
    appointmentStartDateTime: Date
    status: 'PAID' | 'FAILED' | 'PENDING' | 'REFUNDED'
    isPaid: boolean
  }
>

@Injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute({
    providerPaymentId,
    professionalAccessToken,
  }: HandlePaymentWebhookUseCaseRequest): Promise<HandlePaymentWebhookUseCaseResponse> {
    const paymentDetails = await this.paymentGateway.getPaymentDetails(
      providerPaymentId,
      professionalAccessToken,
    )

    const transaction =
      await this.transactionRepository.findByExternalReference(
        paymentDetails.externalReference,
      )

    if (!transaction) {
      return left(new NotFoundError('Transaction not found.'))
    }

    const mpStatus = paymentDetails.status

    let domainStatus: 'PAID' | 'FAILED' | 'PENDING' | 'REFUNDED' = 'PENDING'
    if (mpStatus === 'approved') {
      domainStatus = 'PAID'
      transaction.markAsPaid(paymentDetails.paymentId)
    } else if (
      mpStatus === 'rejected' ||
      mpStatus === 'cancelled' ||
      mpStatus === 'refunded'
    ) {
      domainStatus = mpStatus === 'refunded' ? 'REFUNDED' : 'FAILED'
      transaction.markAsFailed()
    }

    await this.transactionRepository.save(transaction)

    const appointment = await this.appointmentRepository.findById(
      transaction.externalReference,
    )

    if (!appointment) {
      return left(new NotFoundError('Appointment not found.'))
    }

    const isPaid = domainStatus === 'PAID'

    if (isPaid) {
      appointment.paymentStatus = 'SUCCEEDED'
      appointment.markAsPaid()
    } else if (domainStatus === 'FAILED') {
      appointment.paymentStatus = 'FAILED'
    } else if (domainStatus === 'REFUNDED') {
      appointment.paymentStatus = 'REFUNDED'
    }

    await this.appointmentRepository.save(appointment)

    return right({
      appointmentId: appointment.id.toString(),
      clientId: appointment.clientId.toString(),
      professionalId: appointment.professionalId.toString(),
      amount: transaction.amount,
      appointmentStartDateTime: appointment.startDateTime,
      status: domainStatus,
      isPaid,
    })
  }
}
