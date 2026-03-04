import { TransactionRepository } from '@/domain/payments/application/repositories/transaction.repository'
import {
  Transaction,
  TransactionStatus,
} from '@/domain/payments/enterprise/entities/transaction'
import { Injectable } from '@nestjs/common'
import { PaymentStatus } from '@prisma/client'
import { PrismaTransactionMapper } from '../../mappers/prisma-transaction-mapper'
import { PrismaService } from '../prisma.service'

const domainStatusToPrismaStatus: Record<TransactionStatus, PaymentStatus> = {
  PENDING: PaymentStatus.PENDING,
  PAID: PaymentStatus.SUCCEEDED,
  FAILED: PaymentStatus.FAILED,
  REFUNDED: PaymentStatus.REFUNDED,
  PROCESSING: PaymentStatus.PROCESSING,
}

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction): Promise<void> {
    const data = PrismaTransactionMapper.toPrisma(transaction)
    await this.prisma.transaction.create({ data })
  }

  async findById(id: string): Promise<Transaction | null> {
    const raw = await this.prisma.transaction.findUnique({ where: { id } })
    if (!raw) return null
    return PrismaTransactionMapper.toDomain(raw)
  }

  async findByExternalId(externalId: string): Promise<Transaction | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: { providerPaymentId: externalId },
    })
    if (!raw) return null
    return PrismaTransactionMapper.toDomain(raw)
  }

  async findByExternalReference(externalReference: string): Promise<Transaction | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: { externalReference },
      orderBy: { createdAt: 'desc' },
    })
    if (!raw) return null
    return PrismaTransactionMapper.toDomain(raw)
  }

  async fetchManyByStatus(status: TransactionStatus): Promise<Transaction[]> {
    const rows = await this.prisma.transaction.findMany({
      where: { status: domainStatusToPrismaStatus[status] },
    })

    return rows.map(PrismaTransactionMapper.toDomain)
  }

  async save(transaction: Transaction): Promise<void> {
    const data = PrismaTransactionMapper.toPrisma(transaction)
    await this.prisma.transaction.update({
      where: { id: transaction.id.toString() },
      data,
    })
  }
}
