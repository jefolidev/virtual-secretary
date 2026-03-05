import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { MercadoPagoToken } from '@/domain/payments/enterprise/entities/mercado-pago-token'
import type { MercadoPagoToken as PrismaMercadoPagoToken } from '@prisma/client'

export class PrismaMercadoPagoTokenMapper {
  static toDomain(raw: PrismaMercadoPagoToken): MercadoPagoToken {
    return MercadoPagoToken.create(
      {
        professionalId: raw.professionalId,
        accessToken: raw.accessToken,
        refreshToken: raw.refreshToken,
        publicKey: raw.publicKey,
        mpUserId: raw.mpUserId,
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(token: MercadoPagoToken) {
    return {
      id: token.id.toString(),
      professionalId: token.professionalId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      publicKey: token.publicKey,
      mpUserId: token.mpUserId,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    }
  }
}
