import { useState } from 'react'
import type { DayScheduleGridProps, MouseIndicator } from '../../types'
import {
  calculateDynamicRowHeight,
  generateTimeSlots,
  getAppointmentPosition,
} from '../../utils'
import { AppointmentCard } from '../appointment-card'

export function DayScheduleGrid({ date, appointments }: DayScheduleGridProps) {
  const [mouseIndicator, setMouseIndicator] = useState<MouseIndicator>({
    visible: false,
    y: 0,
    time: '',
  })

  const timeSlots = generateTimeSlots(8, 18)
  const dayAppointments = appointments.filter(
    (apt) => apt.date === date.toISOString().split('T')[0]
  )

  // Função para calcular altura dinâmica de cada linha baseado nos agendamentos
  const getRowHeight = (time: string) => {
    return calculateDynamicRowHeight(dayAppointments, time)
  }

  // Função para calcular horário baseado na posição Y do mouse
  const calculateTimeFromY = (y: number) => {
    let accumulatedHeight = 0
    let targetHour = 8

    // Encontrar em qual slot de horário o mouse está
    for (const timeSlot of timeSlots) {
      const rowHeight = getRowHeight(timeSlot)
      if (y <= accumulatedHeight + rowHeight) {
        const relativeY = y - accumulatedHeight
        const minutesIntoHour = (relativeY / rowHeight) * 60
        const [slotHour] = timeSlot.split(':').map(Number)
        const totalMinutes = slotHour * 60 + minutesIntoHour
        const hours = Math.floor(totalMinutes / 60)
        const minutes = Math.floor(totalMinutes % 60)
        return `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`
      }
      accumulatedHeight += rowHeight
      targetHour++
    }

    // Fallback para o último horário se não encontrou
    return `${targetHour.toString().padStart(2, '0')}:00`
  }

  // Handlers de mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const time = calculateTimeFromY(y)
    setMouseIndicator({ visible: true, y, time })
  }

  const handleMouseLeave = () => {
    setMouseIndicator({ visible: false, y: 0, time: '' })
  }

  return (
    <div className="flex h-full">
      {/* Coluna de horários */}
      <div className="w-18 border-r shrink-0">
        <div className="h-12"></div> {/* Espaço para header */}
        {timeSlots.map((time) => (
          <div
            key={time}
            className="border-b border-gray-300 dark:border-gray-50/10 flex items-start pt-2 pr-2 pl-3"
            style={{ height: `${getRowHeight(time)}px` }}
          >
            <span className="text-sm text-muted-foreground font-medium">
              {time}
            </span>
          </div>
        ))}
      </div>

      {/* Área de agendamentos */}
      <div className="flex-1 relative min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-gray-300 dark:border-gray-50/10 flex items-center px-4">
          <span className="font-medium truncate">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(date)}
          </span>
        </div>

        {/* Container das linhas de horário com posicionamento relativo */}
        <div
          className="relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Linhas de horário */}
          {timeSlots.map((time) => {
            const rowHeight = getRowHeight(time)
            return (
              <div
                key={time}
                className="border-b border-gray-300 dark:border-gray-50/10 hover:bg-gray-50/20 transition-colors relative"
                style={{ height: `${rowHeight}px`, zIndex: 1 }}
              ></div>
            )
          })}

          {/* Indicador de linha do mouse */}
          {mouseIndicator.visible && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: `${mouseIndicator.y}px` }}
            >
              {/* Bolinha */}
              <div
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{ left: '0px', top: '-1px' }}
              ></div>
              {/* Linha */}
              <div
                className="absolute h-0.5 bg-red-400 rounded-sm"
                style={{ left: '9px', right: '0px', top: '1px' }}
              ></div>
              {/* Legenda com horário */}
              <div
                className="absolute bg-red-400 text-white px-2 py-1 rounded text-xs font-medium transform -translate-y-1/2"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              >
                {mouseIndicator.time}
              </div>
            </div>
          )}

          {/* Agendamentos posicionados absolutamente */}
          {dayAppointments.map((appointment) => {
            const { top } = getAppointmentPosition(
              appointment,
              8,
              timeSlots,
              getRowHeight
            )

            // Verificar se existe outro agendamento no mesmo horário
            const sameTimeAppointments = dayAppointments.filter(
              (apt) => apt.time === appointment.time
            )
            let columnPosition = 0
            let shouldStackVertically = false

            if (sameTimeAppointments.length > 1) {
              const currentIndex = sameTimeAppointments.findIndex(
                (apt) => apt.id === appointment.id
              )

              // Verificar se há agendamentos cancelados no mesmo horário
              const cancelledAppointments = sameTimeAppointments.filter((apt) =>
                ['cancelado', 'remarcado', 'no-show'].includes(apt.status)
              )
              const activeAppointments = sameTimeAppointments.filter(
                (apt) =>
                  !['cancelado', 'remarcado', 'no-show'].includes(apt.status)
              )

              // Se há cancelados e ativos no mesmo horário, empilhar verticalmente
              if (
                cancelledAppointments.length > 0 &&
                activeAppointments.length > 0
              ) {
                shouldStackVertically = true

                // Cancelados ficam em cima, ativos embaixo
                const isCancelled = [
                  'cancelado',
                  'remarcado',
                  'no-show',
                ].includes(appointment.status)
                columnPosition = isCancelled ? 0 : 1
              } else {
                // Apenas agendamentos do mesmo tipo, lado a lado
                columnPosition = currentIndex
              }
            }

            // Posicionamento correto dentro das células - melhorado
            const cellPadding = 3 // Padding para não grudar nas linhas
            const verticalPadding = shouldStackVertically ? 8 : 10 // Padding vertical aumentado

            // Calcular altura dos cards baseado se estão empilhados ou não
            const rowHeight = getRowHeight(appointment.time)
            const cardHeight = shouldStackVertically
              ? Math.min((rowHeight - verticalPadding * 4) / 2, 90) // Aumentar altura para cards empilhados
              : Math.min(rowHeight - verticalPadding * 2, 95) // Aumentar altura para cards únicos

            // Posicionamento horizontal mais preciso - cards menores
            let leftPosition, cardWidth
            if (shouldStackVertically) {
              // Cards empilhados verticalmente usam largura menor
              leftPosition = cellPadding + 10
              cardWidth = `calc(65% - ${cellPadding * 2}px)` // Largura reduzida para 65%
            } else if (columnPosition === 1) {
              // Segunda coluna (lado a lado)
              leftPosition = '55%'
              cardWidth = '35%' // Largura reduzida para 35%
            } else {
              // Primeira coluna ou única
              leftPosition = cellPadding + 10
              cardWidth =
                columnPosition === 0 && sameTimeAppointments.length > 1
                  ? '35%' // Primeira coluna quando tem duas lado a lado
                  : '25%' // Card único com largura bem reduzida
            }

            // Calcular posição vertical
            const topOffset = shouldStackVertically
              ? top + verticalPadding + columnPosition * (cardHeight + 8) // Espaço controlado entre cards empilhados
              : top + verticalPadding

            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isWeekView={false}
                className="absolute"
                style={{
                  top: `${topOffset}px`,
                  height: `${cardHeight}px`,
                  left:
                    typeof leftPosition === 'string'
                      ? leftPosition
                      : `${leftPosition}px`,
                  width: cardWidth,
                  zIndex: 20 + columnPosition,
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
