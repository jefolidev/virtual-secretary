export type MercadoPagoConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface MercadoPagoStatus {
  connected: boolean
  status: MercadoPagoConnectionStatus
  mpUserId: string | null
  tokenExpiresAt: string | null
  connectedAt: string | null
}
