import {
    MercadoPagoConnectionStatus,
    MercadoPagoToken,
} from '../../enterprise/entities/mercado-pago-token';

export abstract class MercadoPagoTokenRepository {
  abstract findByProfessionalId(
    professionalId: string,
  ): Promise<MercadoPagoToken | null>

  abstract findByMpUserId(mpUserId: string): Promise<MercadoPagoToken | null>

  abstract save(token: MercadoPagoToken): Promise<void>

  abstract delete(professionalId: string): Promise<void>

  abstract updateConnectionStatus(
    professionalId: string,
    status: MercadoPagoConnectionStatus,
  ): Promise<void>
}
