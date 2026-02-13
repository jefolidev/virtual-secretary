import type { FetchProfessionalSchedulesSchema } from '@/api/schemas/fetch-professional-schedules.dto'
import { useState } from 'react'
import { calculateSlotHeight, generateTimeSlots } from '../../utils'
import { AppointmentCard } from '../appointment-card'
import { AppointmentModal } from '../appointment-modal'

interface RefactoredWeekGridProps {
  weekDays: Date[]
  schedules: FetchProfessionalSchedulesSchema[]
}

export function WeekScheduleGrid({
  weekDays,
  schedules,
}: RefactoredWeekGridProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<FetchProfessionalSchedulesSchema | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const timeSlots = generateTimeSlots(7, 22)
  // Usar colunas responsivas para evitar overflow horizontal em telas pequenas
  // cada coluna terá pelo menos 100px e crescerá igualmente
  const dayColumnTemplate = `repeat(${weekDays.length}, minmax(100px, 1fr))`

  // --- CORREÇÃO DE TIPAGEM AQUI ---
  // Passamos 'schedules' diretamente. A função utils deve estar preparada
  // para receber o objeto completo e acessar .appointments internamente.
  const slotHeights = timeSlots.map((time) =>
    calculateSlotHeight(schedules, time),
  )

  const slotPositions = slotHeights.reduce((acc: number[], _, index) => {
    index === 0
      ? acc.push(0)
      : acc.push(acc[index - 1] + slotHeights[index - 1])
    return acc
  }, [])

  const totalHeight = slotHeights.reduce((sum, height) => sum + height, 0)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Cabeçalho dos dias */}
      <div className="h-12 border-b border-gray-300 dark:border-gray-50/20 flex shrink-0">
        <div className="w-16 sm:w-18"></div>
        <div
          className="flex-1 grid"
          style={{ gridTemplateColumns: dayColumnTemplate }}
        >
          {weekDays.map((date, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center border-r dark:border-gray-50/20 last:border-r-0"
            >
              <span className="text-xs text-muted-foreground uppercase">
                {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </span>
              <span className="text-sm font-bold">{date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex overflow-auto w-full">
          {/* Coluna de Horas */}
          <div className="w-16 sm:w-18 shrink-0 bg-muted/5">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="border-b dark:border-gray-50/10 flex items-start pt-2 px-2"
                style={{ height: `${slotHeights[index]}px` }}
              >
                <span className="text-xs text-muted-foreground font-medium">
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* Área do Grid */}
          <div
            className="flex-1 relative"
            style={{ height: `${totalHeight}px` }}
          >
            {/* Linhas Horizontais */}
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="border-b dark:border-gray-50/10 absolute w-full"
                style={{
                  top: `${slotPositions[index]}px`,
                  height: `${slotHeights[index]}px`,
                }}
              />
            ))}

            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: dayColumnTemplate }}
            >
              {weekDays.map((date, dayIndex) => {
                const daySchedules = schedules.filter((item) => {
                  const aptDate = new Date(item.appointments.startDateTime)
                  return (
                    aptDate.getDate() === date.getDate() &&
                    aptDate.getMonth() === date.getMonth()
                  )
                })

                return (
                  <div
                    key={`day-${dayIndex}`}
                    className="relative border-r dark:border-gray-50/20 last:border-r-0"
                  >
                    {daySchedules.map((item) => {
                      const apt = item.appointments
                      const aptDate = new Date(apt.startDateTime)

                      // Formatação segura de hora para busca no index
                      const timeStr = aptDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })

                      const slotIndex = timeSlots.findIndex(
                        (s) => s === timeStr,
                      )

                      if (slotIndex === -1) return null

                      const slotTop = slotPositions[slotIndex]
                      const slotHeight = slotHeights[slotIndex]

                      const collisions = daySchedules.filter(
                        (s) =>
                          new Date(s.appointments.startDateTime).getTime() ===
                          aptDate.getTime(),
                      )
                      const colIndex = collisions.findIndex(
                        (s) => s.appointments.id === apt.id,
                      )

                      // Empilhar verticalmente: cada item ocupa a largura total
                      // e é deslocado verticalmente pelo índice de colisão.
                      const perItemHeight = Math.max(
                        60,
                        slotHeight / Math.max(1, collisions.length),
                      )
                      const stackedTop = slotTop + colIndex * perItemHeight

                      return (
                        <div
                          key={apt.id}
                          className="absolute p-0.5"
                          style={{
                            top: `${stackedTop}px`,
                            left: `0%`,
                            width: `100%`,
                            height: `${perItemHeight}px`,
                            zIndex: 10 - colIndex,
                          }}
                        >
                          <AppointmentCard
                            schedule={item}
                            onClick={() => {
                              setSelectedAppointment(item)
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
          </div>
        </div>
      </div>

      <AppointmentModal
        schedule={selectedAppointment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
