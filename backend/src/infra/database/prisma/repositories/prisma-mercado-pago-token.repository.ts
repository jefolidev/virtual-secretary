import { MercadoPagoTokenRepository } from '@/domain/payments/application/repositories/mercado-pago-token.repository'
import {
    MercadoPagoConnectionStatus,
    MercadoPagoToken,
} from '@/domain/payments/enterprise/entities/mercado-pago-token'
import { PrismaMercadoPagoTokenMapper } from '@/infra/database/mappers/prisma-mercado-pago-token-mapper'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaMercadoPagoTokenRepository implements MercadoPagoTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfessionalId(
    professionalId: string,
  ): Promise<MercadoPagoToken | null> {
    const raw = await this.prisma.mercadoPagoToken.findUnique({
      where: { professionalId },
    })

    if (!raw) return null

    return PrismaMercadoPagoTokenMapper.toDomain(raw)
  }

  async findByMpUserId(mpUserId: string): Promise<MercadoPagoToken | null> {
    const raw = await this.prisma.mercadoPagoToken.findFirst({
      where: { mpUserId },
    })

    if (!raw) return null

    return PrismaMercadoPagoTokenMapper.toDomain(raw)
  }

  async save(token: MercadoPagoToken): Promise<void> {
    const data = PrismaMercadoPagoTokenMapper.toPrisma(token)

    await this.prisma.$transaction([
      this.prisma.mercadoPagoToken.upsert({
        where: { professionalId: data.professionalId },
        create: data,
        update: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          publicKey: data.publicKey,
          mpUserId: data.mpUserId,
          expiresAt: data.expiresAt,
        },
      }),
      this.prisma.professional.update({
        where: { id: data.professionalId },
        data: {
          mercadoPagoAccountId: data.mpUserId,
          mercadoPagoConnectionStatus: 'CONNECTED',
        },
      }),
    ])
  }

  async delete(professionalId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mercadoPagoToken.deleteMany({
        where: { professionalId },
      }),
      this.prisma.professional.update({
        where: { id: professionalId },
        data: {
          mercadoPagoAccountId: null,
          mercadoPagoConnectionStatus: 'DISCONNECTED',
        },
      }),
    ])
  }

  async updateConnectionStatus(
    professionalId: string,
    status: MercadoPagoConnectionStatus,
  ): Promise<void> {
    await this.prisma.professional.update({
      where: { id: professionalId },
      data: { mercadoPagoConnectionStatus: status },
    })
  }
}
