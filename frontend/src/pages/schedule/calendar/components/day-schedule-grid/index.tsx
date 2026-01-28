import type { Appointment } from '@/services/professional/dto/fetch-professional-schedules.dto'
import { useState } from 'react'
import type { DayScheduleGridProps } from '../../types'
import {
  calculateSlotHeight,
  generateTimeSlots,
  MIN_ROW_HEIGHT,
} from '../../utils'
import { AppointmentCard } from '../appointment-card'
import { AppointmentModal } from '../appointment-modal'

export function DayScheduleGrid({ date, schedules }: DayScheduleGridProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const timeSlots = generateTimeSlots(7, 22)
  const dayAppointments = schedules.filter(
    (apt) =>
      apt.appointments.startDateTime.toString().split('T')[0] ===
      date.toISOString().split('T')[0],
  )

  // Calcular alturas dinâmicas para cada slot baseado nos  schedules
  const slotHeights = timeSlots.map((time) =>
    calculateSlotHeight(schedules, time),
  )

  // Calcular posições acumuladas dos slots
  const slotPositions = slotHeights.reduce((acc: number[], _, index) => {
    if (index === 0) {
      acc.push(0)
    } else {
      acc.push(acc[index - 1] + slotHeights[index - 1])
    }
    return acc
  }, [])

  const totalHeight = slotHeights.reduce((sum, height) => sum + height, 0)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-gray-300 dark:border-gray-50/20 flex">
        {/* Espaço para coluna de horários */}
        <div className="w-16 sm:w-18 "></div>
        {/* Título do dia */}
        <div className="flex-1 flex items-center px-4 bg-card">
          <span className="font-medium truncate">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(date)}
          </span>
        </div>
      </div>

      {/* Container principal com scroll */}
      <div className="flex-1 flex overflow-hidden">
        {/* Container com scroll para toda a área */}
        <div
          className="flex overflow-y-auto w-full"
          style={{ height: 'calc(100vh - 280px)' }}
        >
          {/* Coluna de horários que scrolla junto */}
          <div className="w-16 sm:w-18 shrink-0">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="border-b border-gray-300 dark:border-gray-50/10 flex items-start pt-2 pr-2 pl-1 sm:pl-3"
                style={{ height: `${slotHeights[index]}px` }}
              >
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* Área de agendamentos */}
          <div className="flex-1 relative">
            {/* Container das linhas de horário */}
            <div className="relative" style={{ height: `${totalHeight}px` }}>
              {/* Linhas de horário */}
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className="border-b border-gray-300 dark:border-gray-50/10 hover:bg-gray-50/20 transition-colors absolute w-full"
                  style={{
                    top: `${slotPositions[index]}px`,
                    height: `${slotHeights[index]}px`,
                  }}
                />
              ))}

              {/* Agendamentos */}
              {dayAppointments.map((schedule) => {
                // Encontrar o índice do slot de tempo para este appointment
                const slotIndex = timeSlots.findIndex(
                  (slot) =>
                    slot ===
                    schedule.appointments.startDateTime.toLocaleTimeString(
                      'pt-BR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    ),
                )
                const slotTop = slotIndex >= 0 ? slotPositions[slotIndex] : 0
                const slotHeight =
                  slotIndex >= 0 ? slotHeights[slotIndex] : MIN_ROW_HEIGHT

                // Verificar sobreposições no mesmo horário
                const sameTimeAppointments = dayAppointments.filter(
                  (apt) =>
                    apt.appointments.startDateTime ===
                    schedule.appointments.startDateTime,
                )

                let leftOffset = 0
                let widthPercent = 85 // Diminuído de 95 para 85

                if (sameTimeAppointments.length > 1) {
                  const appointmentIndex = sameTimeAppointments.findIndex(
                    (apt) => apt.appointments.id === schedule.appointments.id,
                  )
                  widthPercent = 85 / sameTimeAppointments.length
                  leftOffset = appointmentIndex * widthPercent
                }

                return (
                  <div
                    key={schedule.appointments.id}
                    className="absolute"
                    style={{
                      top: `${slotTop + 2}px`,
                      left: `${leftOffset + 7.5}%`, // Aumentado de 2.5 para 7.5
                      width: `${widthPercent - 2}%`,
                      height: `${Math.max(50, slotHeight - 4)}px`,
                      zIndex: 20,
                      padding: '2px',
                    }}
                  >
                    <AppointmentCard
                      schedule={schedule}
                      onClick={() => {
                        setSelectedAppointment(schedule.appointments)
                        setModalOpen(true)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AppointmentModal
        appointment={selectedAppointment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
