import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  PaymentMethod,
  Transaction,
  type TransactionStatus,
} from '@/domain/payments/enterprise/entities/transaction'
import {
  PaymentMethods,
  PaymentStatus,
  type Transaction as PrismaTransaction,
} from '@prisma/client'

function domainStatusToPrisma(status: TransactionStatus): PaymentStatus {
  const map: Record<TransactionStatus, PaymentStatus> = {
    PENDING: PaymentStatus.PROCESSING,
    PAID: PaymentStatus.SUCCEEDED,
    FAILED: PaymentStatus.FAILED,
    REFUNDED: PaymentStatus.REFUNDED,
    PROCESSING: PaymentStatus.PROCESSING,
  }
  return map[status]
}

function prismaStatusToDomain(status: PaymentStatus): TransactionStatus {
  const map: Record<PaymentStatus, TransactionStatus> = {
    PENDING: 'PENDING',
    SUCCEEDED: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
    PROCESSING: 'PROCESSING',
    NO_PAID: 'FAILED',
  }
  return map[status]
}

function prismaMethodToDomain(method: PaymentMethods): PaymentMethod {
  return method === PaymentMethods.PIX ? 'PIX' : 'CREDIT_CARD'
}

export class PrismaTransactionMapper {
  static toPrisma(transaction: Transaction) {
    return {
      id: transaction.id.toString(),
      appointmentId: transaction.appointmentId.toString(),
      providerPaymentId: transaction.providerPaymentId ?? '',
      providerStatus: transaction.providerStatus ?? 'pending',
      providerStatusDetail: transaction.providerStatusDetail ?? '',
      externalReference: transaction.externalReference,
      amount: transaction.amount,
      feeAmount: transaction.feeAmount,
      lastFourDigits: transaction.lastFourDigits ?? null,
      cardBrand: transaction.cardBrand ?? null,
      installments: transaction.installments ?? null,
      pixCopyPaste: transaction.pixCopyPaste ?? null,
      pixQrCodeURL: transaction.pixQrCodeURL ?? null,
      pixExpiresAt: transaction.pixExpiresAt ?? null,
      failureReason: transaction.failureReason ?? null,
      metadata: transaction.metadata ?? {},
      status: domainStatusToPrisma(transaction.status),
      method:
        transaction.method === 'PIX' ? PaymentMethods.PIX : PaymentMethods.CARD,
      createdAt: transaction.createdAt,
      paidAt: transaction.paidAt ?? null,
    }
  }

  static toDomain(raw: PrismaTransaction): Transaction {
    return Transaction.create(
      {
        clientId: new UniqueEntityId(raw.appointmentId),
        appointmentId: new UniqueEntityId(raw.appointmentId),

        providerPaymentId: raw.providerPaymentId,
        providerStatus: raw.providerStatus,
        providerStatusDetail: raw.providerStatusDetail,

        externalReference: raw.externalReference,

        lastFourDigits: raw.lastFourDigits,
        cardBrand: raw.cardBrand,
        installments: raw.installments,

        pixExpiresAt: raw.pixExpiresAt ?? undefined,
        pixCopyPaste: raw.pixCopyPaste ?? undefined,
        pixQrCodeURL: raw.pixQrCodeURL ?? undefined,

        amount: Number(raw.amount),
        feeAmount: Number(raw.feeAmount),

        failureReason: raw.failureReason,
        metadata: raw.metadata as Record<string, any>,

        method: prismaMethodToDomain(raw.method),
        status: prismaStatusToDomain(raw.status),

        createdAt: raw.createdAt,
        paidAt: raw.paidAt,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
