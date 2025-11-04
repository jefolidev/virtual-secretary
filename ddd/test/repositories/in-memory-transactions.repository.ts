import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { TransactionRepository } from '@src/domain/payments/application/repositories/transaction.repository'
import type {
  Transaction,
  TransactionStatus,
} from '@src/domain/payments/enterprise/entities/transaction'

export class InMemoryTransactionsRepository implements TransactionRepository {
  public items: Transaction[] = []

  async create(transaction: Transaction): Promise<void> {
    await this.items.push(transaction)
  }

  async findByExternalId(externalId: string): Promise<Transaction | null> {
    const transaction = await this.items.find(
      (transaction) => transaction.externalPaymentId === externalId
    )

    return transaction ?? null
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.items.find((transaction) =>
      transaction.id.equals(new UniqueEntityId(id))
    )
    return transaction ?? null
  }

  async fetchManyByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return await this.items.filter(
      (transaction) => transaction.status === status
    )
  }

  async save(transaction: Transaction): Promise<void> {
    const transactionIndex = await this.items.findIndex((item) =>
      item.id.equals(transaction.id)
    )

    this.items[transactionIndex] = transaction
  }
}
