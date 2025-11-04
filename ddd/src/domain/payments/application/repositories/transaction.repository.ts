import type {
  Transaction,
  TransactionStatus,
} from '../../enterprise/entities/transaction'

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>
  findByExternalId(externalId: string): Promise<Transaction | null>
  findById(id: string): Promise<Transaction | null>
  fetchManyByStatus(status: TransactionStatus): Promise<Transaction[]>
  save(transaction: Transaction): Promise<void>
}
