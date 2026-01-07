// Tipos
export interface Appointment {
  id: string
  patientName: string
  time: string
  endTime?: string
  date: string
  type: 'consulta' | 'retorno'
  modalidade: 'presencial' | 'remota'
  status:
    | 'agendado'
    | 'confirmado'
    | 'cancelado'
    | 'finalizado'
    | 'nao-pago'
    | 'pago'
    | 'no-show'
    | 'remarcado'
  duration?: number // em minutos
}

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
