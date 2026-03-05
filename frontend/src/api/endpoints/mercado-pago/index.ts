import { api } from '@/api/axios'
import type { MercadoPagoStatus } from './dto'

export const mercadoPagoServices = {
  getStatus: async (): Promise<MercadoPagoStatus> => {
    const response = await api.get('/mercado-pago/status')
    return response.data
  },

  connect: async (): Promise<void> => {
    const response = await api.get<{ url: string }>('/mercado-pago/connect-url')
    window.location.href = response.data.url
  },

  disconnect: async (): Promise<void> => {
    await api.delete('/mercado-pago/disconnect')
  },
}

