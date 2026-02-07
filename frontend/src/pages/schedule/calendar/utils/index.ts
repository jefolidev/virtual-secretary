import type { FetchProfessionalSchedulesSchema } from '@/api/schemas/fetch-professional-schedules.dto'

// Constantes simplificadas
export const HOUR_HEIGHT = 115 // altura fixa por hora
export const MIN_ROW_HEIGHT = 120 // altura mínima das linhas quando não há appointments
export const SLOTS_PER_HOUR = 1 // slots por hora (sempre 1 para simplicidade)
export const calculateSlotHeight = (
  schedules: FetchProfessionalSchedulesSchema[], // Nome alterado para clareza
  time: string,
) => {
  const slotAppointments = (schedules || []).filter((item) => {
    if (!item?.appointments?.startDateTime) return false

    // Converte a data do agendamento para o formato HH:mm para comparar com 'time'
    const aptTime = new Date(
      item.appointments.startDateTime,
    ).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return aptTime === time
  })

  if (slotAppointments.length === 0) {
    return MIN_ROW_HEIGHT
  }

  // Se houver mais de um agendamento no mesmo horário, a linha cresce
  const maxOverlap = slotAppointments.length
  const baseHeight = Math.max(HOUR_HEIGHT, maxOverlap * 60)

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

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const getAppointmentPosition = (
  appointment: FetchProfessionalSchedulesSchema['appointments'],
  startHour = 7,
) => {
  const startMinutes = timeToMinutes(appointment.startDateTime.toDateString())
  const gridStartMinutes = startHour * 60

  // Posição baseada na diferença de minutos desde o início da grade
  const top = ((startMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT

  // Altura baseada na duração
  const endMinutes = appointment.endDateTime
    ? timeToMinutes(appointment.endDateTime.toDateString())
    : startMinutes + 60
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT

  return { top, height }
}

export const getRowHeight = () => HOUR_HEIGHT

export const formatDate = (
  date: Date,
  format: 'full' | 'month' | 'day' = 'full',
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
