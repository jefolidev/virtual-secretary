import type { MercadoPagoTokenRepository } from '@/domain/payments/application/repositories/mercado-pago-token.repository'
import type { MercadoPagoConnectionStatus, MercadoPagoToken } from '@/domain/payments/enterprise/entities/mercado-pago-token'

export class InMemoryMercadoPagoTokenRepository implements MercadoPagoTokenRepository {
  public items: MercadoPagoToken[] = []
  public connectionStatuses: Map<string, MercadoPagoConnectionStatus> =
    new Map()

  async findByProfessionalId(
    professionalId: string,
  ): Promise<MercadoPagoToken | null> {
    return this.items.find((t) => t.professionalId === professionalId) ?? null
  }

  async save(token: MercadoPagoToken): Promise<void> {
    const index = this.items.findIndex(
      (t) => t.professionalId === token.professionalId,
    )

    if (index >= 0) {
      this.items[index] = token
    } else {
      this.items.push(token)
    }
  }

  async delete(professionalId: string): Promise<void> {
    this.items = this.items.filter((t) => t.professionalId !== professionalId)
  }

  async updateConnectionStatus(
    professionalId: string,
    status: MercadoPagoConnectionStatus,
  ): Promise<void> {
    this.connectionStatuses.set(professionalId, status)
  }
}
