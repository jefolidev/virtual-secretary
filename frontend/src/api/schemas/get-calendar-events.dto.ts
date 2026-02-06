import type { CalendarEvent } from '../../endpoints/google-calendar'

export interface GetCalendarEventsResponse {
  events: CalendarEvent[]
}
