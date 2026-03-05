import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type TransactionStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PROCESSING'

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'

export interface TransactionProps {
  clientId: UniqueEntityId
  appointmentId: UniqueEntityId

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

export class Transaction extends Entity<TransactionProps> {
  get clientId() {
    return this.props.clientId
  }

  get appointmentId() {
    return this.props.appointmentId
  }

  get providerPaymentId() {
    return this.props.providerPaymentId
  }

  get providerStatus() {
    return this.props.providerStatus
  }

  get providerStatusDetail() {
    return this.props.providerStatusDetail
  }

  get externalReference() {
    return this.props.externalReference
  }

  get lastFourDigits() {
    return this.props.lastFourDigits
  }

  get installments() {
    return this.props.installments
  }

  get pixExpiresAt() {
    return this.props.pixExpiresAt
  }

  get pixCopyPaste() {
    return this.props.pixCopyPaste
  }

  get pixQrCodeURL() {
    return this.props.pixQrCodeURL
  }

  get feeAmount() {
    return this.props.feeAmount
  }

  get failureReason() {
    return this.props.failureReason
  }

  get metadata() {
    return this.props.metadata
  }

  get method() {
    return this.props.method
  }

  get paidAt() {
    return this.props.paidAt
  }

  get cardBrand() {
    return this.props.cardBrand
  }

  get amount() {
    return this.props.amount
  }

  set amount(amount: number) {
    this.props.amount = amount
  }

  get status() {
    return this.props.status
  }

  set status(status: TransactionStatus) {
    this.props.status = status
  }

  get createdAt() {
    return this.props.createdAt
  }

  public markAsPaid(externalPaymentId: string): void {
    if (this.props.status !== 'PENDING')
      throw new Error('Is not possible pay a transaction that is not pendent.')

    this.props.status = 'PAID'
    this.props.paidAt = new Date()
  }

  public markAsFailed(): void {
    if (this.props.status === 'PAID')
      throw new Error('The transaction has been failed')

    this.props.status = 'FAILED'
  }

  static create(
    props: Optional<TransactionProps, 'createdAt' | 'status' | 'paidAt'>,
    id?: UniqueEntityId,
  ) {
    const transaction = new Transaction(
      {
        ...props,
        status: props.status ?? 'PENDING',

        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return transaction
  }
}
