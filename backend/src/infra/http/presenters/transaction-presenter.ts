import { Transaction } from '@/domain/payments/enterprise/entities/transaction'

export class TransactionPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id.toString(),
      appointmentId: transaction.appointmentId.toString(),
      status: transaction.status,
      method: transaction.method,
      amount: transaction.amount,
      feeAmount: transaction.feeAmount,
      providerPaymentId: transaction.providerPaymentId,
      providerStatus: transaction.providerStatus,
      lastFourDigits: transaction.lastFourDigits,
      cardBrand: transaction.cardBrand,
      installments: transaction.installments,
      pixCopyPaste: transaction.pixCopyPaste ?? null,
      pixQrCodeURL: transaction.pixQrCodeURL ?? null,
      pixExpiresAt: transaction.pixExpiresAt ?? null,
      failureReason: transaction.failureReason,
      paidAt: transaction.paidAt ?? null,
      createdAt: transaction.createdAt,
    }
  }
}
