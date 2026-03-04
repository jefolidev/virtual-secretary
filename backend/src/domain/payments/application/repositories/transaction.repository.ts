import type {
  Transaction,
  TransactionStatus,
} from '../../enterprise/entities/transaction';

export abstract class TransactionRepository {
  abstract create(transaction: Transaction): Promise<void>
  abstract findByExternalId(externalId: string): Promise<Transaction | null>
  abstract findByExternalReference(externalReference: string): Promise<Transaction | null>
  abstract findById(id: string): Promise<Transaction | null>
  abstract fetchManyByStatus(status: TransactionStatus): Promise<Transaction[]>
  abstract save(transaction: Transaction): Promise<void>
}
