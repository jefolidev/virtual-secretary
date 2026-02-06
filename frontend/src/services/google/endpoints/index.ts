import { api } from '@/api/axios'
import type { CreateCalendarEventRequest } from '../dto/create-calendar-event.dto'
import type { GetAuthUrlResponse } from '../dto/get-auth-url.dto'
import type { GetCalendarEventsResponse } from '../dto/get-calendar-events.dto'
import type { OAuthCallbackResponse } from '../dto/oauth-callback.dto'

const BASE_PATH = '/webhooks/google'

export const googleCalendarService = {
  /**
   * GET /webhooks/google/auth/url/:professionalId
   * Obtém URL de autorização do Google OAuth
   */
  async getAuthUrl(professionalId: string): Promise<GetAuthUrlResponse> {
    const response = await api.get<GetAuthUrlResponse>(
      `${BASE_PATH}/auth/url/${professionalId}`,
    )
    return response.data
  },

  /**
   * GET /webhooks/google/oauth/callback
   * Processa callback do OAuth (geralmente usado em redirecionamento)
   */
  async handleOAuthCallback(
    code: string,
    state: string,
  ): Promise<OAuthCallbackResponse> {
    const response = await api.get<OAuthCallbackResponse>(
      `${BASE_PATH}/oauth/callback`,
      {
        params: { code, state },
      },
    )
    return response.data
  },

  /**
   * POST /webhooks/google/calendar-events
   * Cria um evento no Google Calendar para um appointment
   */
  async createCalendarEvent(
    data: CreateCalendarEventRequest,
  ): Promise<CreateCalendarEventRequest> {
    const response = await api.post<CreateCalendarEventRequest>(
      `${BASE_PATH}/calendar-events`,
      data,
    )
    return response.data
  },

  /**
   * GET /webhooks/google/events/:id
   * Lista todos os eventos do Google Calendar de um profissional
   */
  async getCalendarEvents(
    professionalId: string,
    page: number = 1,
  ): Promise<GetCalendarEventsResponse> {
    const response = await api.get<GetCalendarEventsResponse>(
      `${BASE_PATH}/events/${professionalId}`,
      {
        params: { page },
      },
    )
    return response.data
  },

  /**
   * GET /webhooks/google/connected/:professionalId
   * Verifica se um profissional está conectado ao Google Calendar
   */
  async isGoogleCalendarConnected(professionalId: string): Promise<boolean> {
    const response = await api.get<{ isConnected: boolean }>(
      `${BASE_PATH}/connected/${professionalId}`,
    )

    return response.data.isConnected
  },
}
