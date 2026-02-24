import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import { useState } from 'react'
import {
  calculateSlotHeight,
  generateTimeSlots,
  HOUR_HEIGHT,
  timeToMinutes,
} from '../../utils'
import { AppointmentCard } from '../appointment-card'
import { AppointmentModal } from '../appointment-modal'

interface WeekScheduleGridProps {
  weekDays: Date[]
  schedule: FetchProfessionalSchedulesResponse[]
}

export function WeekScheduleGrid({
  weekDays,
  schedule,
}: WeekScheduleGridProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<FetchProfessionalSchedulesResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const timeSlots = generateTimeSlots(7, 22)
  const dayColumnTemplate = `repeat(${weekDays.length}, minmax(100px, 1fr))`

  const slotHeights = timeSlots.map((time) => {
    const match = schedule.find((item) => {
      const aptTime = new Date(
        item.appointment.startDateTime,
      ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      return aptTime === time
    })

    return match ? calculateSlotHeight(match, time) : HOUR_HEIGHT
  })

  const slotPositions = slotHeights.reduce((acc: number[], _, index) => {
    index === 0
      ? acc.push(0)
      : acc.push(acc[index - 1] + slotHeights[index - 1])
    return acc
  }, [])

  const totalHeight = slotHeights.reduce((sum, height) => sum + height, 0)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
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

          <div
            className="flex-1 relative"
            style={{ height: `${totalHeight}px` }}
          >
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
                const daySchedules = schedule.filter((item) => {
                  const aptDate = new Date(item.appointment.startDateTime)
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
                      const aptDate = new Date(item.appointment.startDateTime)

                      const timeStr = aptDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })

                      const slotIndex = timeSlots.findIndex((s) => {
                        const slotMinutes = timeToMinutes(s)
                        const aptMinutes = timeToMinutes(timeStr)
                        return (
                          aptMinutes >= slotMinutes &&
                          aptMinutes < slotMinutes + 60
                        )
                      })
                      if (slotIndex === -1) return null

                      const slotTop = slotPositions[slotIndex]
                      const slotHeight = slotHeights[slotIndex]

                      const collisions = daySchedules.filter(
                        (s) =>
                          new Date(s.appointment.startDateTime).getTime() ===
                          aptDate.getTime(),
                      )
                      const colIndex = collisions.findIndex(
                        (s) => s.appointment.id === item.appointment.id,
                      )

                      const perItemHeight = Math.max(
                        60,
                        slotHeight / Math.max(1, collisions.length),
                      )
                      const stackedTop = slotTop + colIndex * perItemHeight

                      return (
                        <div
                          key={item.appointment.id}
                          className="absolute p-0.5"
                          style={{
                            top: `${stackedTop}px`,
                            left: '0%',
                            width: '100%',
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
