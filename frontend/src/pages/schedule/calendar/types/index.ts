import type { FetchProfessionalSchedulesSchema } from '@/services/professional/dto/fetch-professional-schedules.dto'

export type ViewMode = 'day' | 'week' | 'month'

export interface AppointmentCardProps {
  schedule: FetchProfessionalSchedulesSchema
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
  hasActiveSession?: boolean
}

export interface DayScheduleGridProps {
  date: Date
  schedules: FetchProfessionalSchedulesSchema
}

export interface WeekScheduleGridProps {
  weekDays: Date[]
  schedules: FetchProfessionalSchedulesSchema
}

export interface DayCardProps {
  date: Date
  schedules: FetchProfessionalSchedulesSchema
  viewMode: ViewMode
  isCurrentMonth?: boolean
}

export interface MouseIndicator {
  visible: boolean
  y: number
  time: string
}

export interface CalendarFilters {
  showAgendado: boolean
  showConfirmado: boolean
  showPago: boolean
  showFinalizado: boolean
  showNaoPago: boolean
  showNoShow: boolean
  showRemarcado: boolean
  showCancelado: boolean
}
