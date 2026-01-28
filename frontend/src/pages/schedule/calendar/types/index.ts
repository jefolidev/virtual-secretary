import type { Appointment } from '@/services/professional/dto/fetch-professional-schedules.dto'

export type ViewMode = 'day' | 'week' | 'month'

export interface AppointmentCardProps {
  appointment: Appointment
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
  hasActiveSession?: boolean
}

export interface DayScheduleGridProps {
  date: Date
  appointments: Appointment[]
}

export interface WeekScheduleGridProps {
  weekDays: Date[]
  appointments: Appointment[]
}

export interface DayCardProps {
  date: Date
  appointments: Appointment[]
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
