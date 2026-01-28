import type { FetchProfessionalSchedulesSchema } from '@/services/professional/dto/fetch-professional-schedules.dto'
import { useState } from 'react'
import { calculateSlotHeight, generateTimeSlots } from '../../utils'
import { AppointmentCard } from '../appointment-card'
import { AppointmentModal } from '../appointment-modal'

// Definimos o tipo baseado no seu log: Array de objetos com a chave appointments
interface RefactoredWeekGridProps {
  weekDays: Date[]
  schedules: FetchProfessionalSchedulesSchema[]
}

export function WeekScheduleGrid({
  weekDays,
  schedules, // Agora recebemos a lista completa (com dados do cliente)
}: RefactoredWeekGridProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<FetchProfessionalSchedulesSchema | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const timeSlots = generateTimeSlots(7, 22)

  // Extraímos apenas as entidades de agendamento para cálculos de altura
  const rawAppointments = schedules.map((s) => s.appointments)

  const slotHeights = timeSlots.map((time) =>
    calculateSlotHeight(rawAppointments, time),
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
          style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
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
        <div
          className="flex overflow-y-auto w-full"
          style={{ height: 'calc(100vh - 280px)' }}
        >
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

            {/* Colunas Verticais e Agendamentos */}
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
            >
              {weekDays.map((date, dayIndex) => {
                // Filtramos o schedule comparando o dia
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

                      const timeStr = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`
                      const slotIndex = timeSlots.findIndex(
                        (s) => s === timeStr,
                      )

                      if (slotIndex === -1) return null

                      const slotTop = slotPositions[slotIndex]
                      const slotHeight = slotHeights[slotIndex]

                      // Cálculo simples de colisão (mesmo horário)
                      const collisions = daySchedules.filter(
                        (s) =>
                          new Date(s.appointments.startDateTime).getTime() ===
                          aptDate.getTime(),
                      )
                      const colIndex = collisions.findIndex(
                        (s) => s.appointments.id === apt.id,
                      )
                      const width = 100 / collisions.length

                      return (
                        <div
                          key={apt.id}
                          className="absolute p-0.5"
                          style={{
                            top: `${slotTop}px`,
                            left: `${colIndex * width}%`,
                            width: `${width}%`,
                            height: `${Math.max(60, slotHeight)}px`,
                            zIndex: 10,
                          }}
                        >
                          <AppointmentCard
                            // Passamos o objeto completo (agendamento + cliente)
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
