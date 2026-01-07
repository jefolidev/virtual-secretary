import type { Appointment } from '../types'

// Constantes simplificadas
export const HOUR_HEIGHT = 115 // altura fixa por hora
export const MIN_ROW_HEIGHT = 50 // altura mínima das linhas quando não há appointments
export const SLOTS_PER_HOUR = 1 // slots por hora (sempre 1 para simplicidade)

// Função para calcular altura dinâmica de cada slot baseada nos appointments
export const calculateSlotHeight = (
  appointments: Appointment[],
  time: string
) => {
  const slotAppointments = appointments.filter((apt) => apt.time === time)

  if (slotAppointments.length === 0) {
    return MIN_ROW_HEIGHT // 50px quando não há appointments
  }

  // Calcular altura baseada no número de appointments sobrepostos
  const maxOverlap = Math.max(1, slotAppointments.length)
  const baseHeight = Math.max(HOUR_HEIGHT, maxOverlap * 60) // Mínimo 115px, ou 60px por appointment

  return baseHeight
}

// Função para gerar slots de horário
export const generateTimeSlots = (startHour = 7, endHour = 22) => {
  const slots = []
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

// Converter horário para minutos
export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Calcular posição de um agendamento de forma simples
export const getAppointmentPosition = (
  appointment: Appointment,
  startHour = 7
) => {
  const startMinutes = timeToMinutes(appointment.time)
  const gridStartMinutes = startHour * 60

  // Posição baseada na diferença de minutos desde o início da grade
  const top = ((startMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT

  // Altura baseada na duração
  const endMinutes = appointment.endTime
    ? timeToMinutes(appointment.endTime)
    : startMinutes + (appointment.duration || 60)
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT

  return { top, height }
}

// Função simples para altura das linhas (sempre fixa)
export const getRowHeight = () => HOUR_HEIGHT

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
