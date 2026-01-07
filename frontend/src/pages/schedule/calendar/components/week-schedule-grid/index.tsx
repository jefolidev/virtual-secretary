import { useState } from 'react'
import type { Appointment, WeekScheduleGridProps } from '../../types'
import {
  calculateSlotHeight,
  generateTimeSlots,
  MIN_ROW_HEIGHT,
} from '../../utils'
import { AppointmentCard } from '../appointment-card'
import { AppointmentModal } from '../appointment-modal'

export function WeekScheduleGrid({
  weekDays,
  appointments,
}: WeekScheduleGridProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const timeSlots = generateTimeSlots(7, 22)

  // Calcular alturas dinâmicas para cada slot baseado nos appointments
  const slotHeights = timeSlots.map((time) =>
    calculateSlotHeight(appointments, time)
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
      {/* Cabeçalho dos dias */}
      <div className="h-12 border-b border-gray-300 dark:border-gray-50/20 flex">
        {/* Espaço para coluna de horários */}
        <div className="w-16 sm:w-18 "></div>
        {/* Cabeçalho dos dias da semana */}
        <div className="flex-1">
          <div
            className="grid h-full"
            style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
          >
            {weekDays.map((date, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center bg-card border-r border-gray-300 dark:border-gray-50/20 last:border-r-0 px-1"
              >
                <span className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </span>
                <span className="text-sm font-medium">{date.getDate()}</span>
              </div>
            ))}
          </div>
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
          {/* Área principal dos agendamentos */}
          <div className="flex-1 relative">
            {/* Grade de horários */}
            <div className="relative" style={{ height: `${totalHeight}px` }}>
              {/* Linhas de grade para horários */}
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

              {/* Grid de colunas para os dias */}
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`,
                }}
              >
                {weekDays.map((_, index) => (
                  <div
                    key={index}
                    className="border-r border-gray-300 dark:border-gray-50/20 last:border-r-0"
                  />
                ))}
              </div>

              {/* Container para agendamentos */}
              <div
                className="absolute inset-0 grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`,
                }}
              >
                {weekDays.map((date, dayIndex) => {
                  const dayAppointments = appointments.filter(
                    (apt) => apt.date === date.toISOString().split('T')[0]
                  )

                  return (
                    <div
                      key={`day-${dayIndex}`}
                      className="relative h-full overflow-hidden"
                    >
                      {/* Agendamentos para este dia */}
                      {dayAppointments.map((appointment) => {
                        // Encontrar o índice do slot de tempo para este appointment
                        const slotIndex = timeSlots.findIndex(
                          (slot) => slot === appointment.time
                        )
                        const slotTop =
                          slotIndex >= 0 ? slotPositions[slotIndex] : 0
                        const slotHeight =
                          slotIndex >= 0
                            ? slotHeights[slotIndex]
                            : MIN_ROW_HEIGHT

                        // Verificar sobreposições no mesmo horário
                        const sameTimeAppointments = dayAppointments.filter(
                          (apt) => apt.time === appointment.time
                        )

                        let leftOffset = 0
                        let widthPercent = 95

                        if (sameTimeAppointments.length > 1) {
                          const appointmentIndex =
                            sameTimeAppointments.findIndex(
                              (apt) => apt.id === appointment.id
                            )
                          widthPercent = 95 / sameTimeAppointments.length
                          leftOffset = appointmentIndex * widthPercent
                        }

                        return (
                          <div
                            key={appointment.id}
                            className="absolute"
                            style={{
                              top: `${slotTop + 2}px`,
                              left: `${leftOffset + 2.5}%`,
                              width: `${widthPercent - 2}%`,
                              height: `${Math.max(50, slotHeight - 4)}px`,
                              zIndex: 20,
                              padding: '2px',
                            }}
                          >
                            <AppointmentCard
                              appointment={appointment}
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setModalOpen(true)
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>{' '}
          </div>{' '}
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
