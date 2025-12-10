import { Client } from '@/domain/scheduling/enterprise/entities/client'

export class ClientsPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id.toString(),
      periodPreference: client.periodPreference,
      extraPreferences: client.extraPreferences,
      appointmentHistory: client.appointmentHistory,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }
  }
}
