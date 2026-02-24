import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'

export const HOUR_HEIGHT = 115
export const MIN_ROW_HEIGHT = 120
export const SLOTS_PER_HOUR = 1
export const calculateSlotHeight = (
  schedule: FetchProfessionalSchedulesResponse,
  time: string,
) => {
  const aptTime = new Date(
    schedule.appointment.startDateTime,
  ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (aptTime === time) {
    return MIN_ROW_HEIGHT
  }

  return HOUR_HEIGHT
}

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
  session: FetchProfessionalSchedulesResponse,
  startHour = 7,
) => {
  const startDate = new Date(session.appointment.startDateTime)
  const startMinutes = timeToMinutes(
    startDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  )
  const gridStartMinutes = startHour * 60
  const top = ((startMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT

  const endDate = session.appointment.endDateTime
    ? new Date(session.appointment.endDateTime)
    : null

  const endMinutes = endDate
    ? timeToMinutes(
        endDate.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    : startMinutes + 60

  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT
  return { top, height }
}
export const getRowHeight = () => HOUR_HEIGHT

export const formatDate = (
  date: Date,
  format: 'full' | 'month' | 'day' = 'full',
) => {
  if (format === 'month') {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
    }).format(date)
  }

  if (format === 'day') {
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(date)
  }

  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
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
