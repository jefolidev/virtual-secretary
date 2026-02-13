export interface GetCalendarEventsResponse {
  id: string
  appointmentId: string
  professionalId: string
  googleEventLink: string
  summary: string
  description: string
  startDateTime: Date
  endDateTime: Date
  syncStatus: string
  lastSyncedAt: Date
  createdAt: Date
  updatedAt: Date
}
