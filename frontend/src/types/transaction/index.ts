export type TransactionStatus =
  | 'PENDING'
  | 'PAID'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PROCESSING'

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'

export interface Transaction {
  clientId: string
  appointmentId: string

  providerPaymentId: string
  providerStatus: string
  providerStatusDetail: string

  externalReference: string

  lastFourDigits: string | null
  cardBrand: string | null
  installments: number | null

  pixExpiresAt?: Date
  pixCopyPaste?: string
  pixQrCodeURL?: string

  amount: number
  feeAmount: number

  failureReason: string | null
  metadata: Record<string, any>

  status: TransactionStatus
  method: PaymentMethod

  createdAt: Date
  paidAt?: Date | null
}
