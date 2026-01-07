import type { Appointment } from '../types'

// Constantes
export const HOUR_HEIGHT = 120 // altura em pixels por hora (padrão)
export const MIN_ROW_HEIGHT = 50 // altura mínima quando não há agendamentos
export const CARD_HEIGHT = 75 // altura base de um card (reduzida)
export const CARD_PADDING = 16 // padding total entre cards (8px * 2)

// Função para calcular altura dinâmica baseada na quantidade de agendamentos
export const calculateDynamicRowHeight = (
  appointments: Appointment[],
  timeSlot: string
): number => {
  const timeAppointments = appointments.filter((apt) => apt.time === timeSlot)

  if (timeAppointments.length === 0) {
    return MIN_ROW_HEIGHT // Altura padrão quando não há agendamentos
  }

  if (timeAppointments.length === 1) {
    return Math.max(CARD_HEIGHT + CARD_PADDING * 2, 120) // Altura aumentada para um card
  }

  // Para múltiplos agendamentos, verificar se há cancelados e ativos
  const cancelledAppointments = timeAppointments.filter((apt) =>
    ['cancelado', 'remarcado', 'no-show'].includes(apt.status)
  )
  const activeAppointments = timeAppointments.filter(
    (apt) => !['cancelado', 'remarcado', 'no-show'].includes(apt.status)
  )

  // Se há tanto cancelados quanto ativos, empilhar verticalmente
  if (cancelledAppointments.length > 0 && activeAppointments.length > 0) {
    return (CARD_HEIGHT + CARD_PADDING) * 2 + CARD_PADDING * 4 // Altura aumentada para cards empilhados
  }

  // Se são todos do mesmo tipo mas múltiplos, lado a lado (altura um pouco maior que single)
  if (timeAppointments.length > 1) {
    return Math.max(CARD_HEIGHT + CARD_PADDING * 2, 125) // Altura aumentada para múltiplos
  }

  // Fallback para altura padrão
  return Math.max(CARD_HEIGHT + CARD_PADDING * 2, 120) // Altura aumentada
}

// Utilitários de data
export const formatDate = (
  date: Date,
  format: 'full' | 'month' | 'day' = 'full'
) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  if (format === 'month') {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
    }).format(date)
  }

  if (format === 'day') {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
    }).format(date)
  }

  return new Intl.DateTimeFormat('pt-BR', options).format(date)
}

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export const getWeekDays = (startDate: Date) => {
  const days = []
  const start = new Date(startDate)
  start.setDate(start.getDate() - start.getDay())

  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  return days
}

export const getMonthDays = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const current = new Date(startDate)

  while (current <= lastDay || days.length < 42) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

// Utilitários para horários
export const generateTimeSlots = (startHour = 8, endHour = 18) => {
  const slots = []
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const getAppointmentPosition = (
  appointment: Appointment,
  startHour = 8,
  timeSlots?: string[],
  getRowHeight?: (time: string) => number
) => {
  const startMinutes = timeToMinutes(appointment.time)
  const endMinutes = appointment.endTime
    ? timeToMinutes(appointment.endTime)
    : startMinutes + (appointment.duration || 60)
  const gridStartMinutes = startHour * 60

  let top = 0

  // Se temos função de altura dinâmica, calcular top considerando alturas variáveis
  if (getRowHeight && timeSlots) {
    const appointmentHour = Math.floor(startMinutes / 60)

    for (let hour = startHour; hour < appointmentHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`
      top += getRowHeight(timeSlot)
    }

    // Adicionar offset dentro da hora atual
    const minutesIntoHour = startMinutes - appointmentHour * 60
    const currentRowHeight = getRowHeight(
      `${appointmentHour.toString().padStart(2, '0')}:00`
    )
    top += (minutesIntoHour / 60) * currentRowHeight
  } else {
    // Cálculo original para quando não há alturas dinâmicas
    top = ((startMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT
  }

  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT

  return { top, height }
}
