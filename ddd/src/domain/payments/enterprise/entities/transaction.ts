import { Entity } from '@src/core/entities/entity'
import type { Optional } from '@src/core/entities/types/optional'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'

export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type PaymentProvider =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'EXTERNAL_GATEWAY'
  | 'CASH'

export interface TransactionProps {
  clientId: UniqueEntityId
  appointmentId: UniqueEntityId
  amount: number

  provider: PaymentProvider
  status: TransactionStatus

  externalPaymentId: string
  linkUrl: string | null

  createdAt: Date
  updatedAt?: Date
}

export class Transaction extends Entity<TransactionProps> {
  get clientId() {
    return this.props.clientId
  }

  get appointmentId() {
    return this.props.appointmentId
  }

  get amount() {
    return this.props.amount
  }

  set amount(amount: number) {
    this.props.amount = amount
    this.touch()
  }

  get status() {
    return this.props.status
  }

  set status(status: TransactionStatus) {
    this.props.status = status
    this.touch()
  }

  get externalPaymentId() {
    return this.props.externalPaymentId
  }

  get linkUrl() {
    return this.props.linkUrl
  }

  set linkUrl(linkUrl: string | null) {
    this.props.linkUrl = linkUrl
    this.touch()
  }

  get provider() {
    return this.props.provider
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  public markAsPaid(externalPaymentId: string): void {
    if (this.props.status !== 'PENDING')
      throw new Error('Is not possible pay a transaction that is not pendent.')

    this.props.status = 'PAID'
    this.props.externalPaymentId = externalPaymentId
    this.touch()
  }

  public markAsFailed(): void {
    if (this.props.status === 'PAID')
      throw new Error('The transaction has been failed')

    this.props.status = 'FAILED'
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      TransactionProps,
      'createdAt' | 'status' | 'externalPaymentId' | 'linkUrl'
    >,
    id?: UniqueEntityId
  ) {
    const transaction = new Transaction(
      {
        ...props,
        status: props.status ?? 'PENDING',
        externalPaymentId: props.externalPaymentId ?? '',
        linkUrl: props.linkUrl ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return transaction
  }
}
