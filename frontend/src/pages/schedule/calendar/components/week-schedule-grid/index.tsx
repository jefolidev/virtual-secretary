import { useSidebar } from '@/components/ui/sidebar'
import { useState } from 'react'
import type { MouseIndicator, WeekScheduleGridProps } from '../../types'
import {
  calculateDynamicRowHeight,
  generateTimeSlots,
  getAppointmentPosition,
} from '../../utils'
import { AppointmentCard } from '../appointment-card'

export function WeekScheduleGrid({
  weekDays,
  appointments,
}: WeekScheduleGridProps) {
  const [mouseIndicator, setMouseIndicator] = useState<MouseIndicator>({
    visible: false,
    y: 0,
    time: '',
  })
  const { open } = useSidebar()

  const timeSlots = generateTimeSlots(8, 18)

  // Função para calcular altura dinâmica baseada nos agendamentos de todos os dias
  const getRowHeight = (time: string) => {
    // Verificar agendamentos de todos os dias para este horário
    const allTimeAppointments = appointments.filter((apt) => apt.time === time)
    const baseHeight = calculateDynamicRowHeight(allTimeAppointments, time)

    // Aumentar altura das células quando sidebar está aberta
    const heightMultiplier = open ? 1.25 : 1
    return Math.floor(baseHeight * heightMultiplier)
  }

  // Função para calcular horário baseado na posição Y do mouse
  const calculateTimeFromY = (y: number) => {
    let accumulatedHeight = 0

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
    }

    // Fallback para o último horário
    return '18:00'
  }

  // Handlers de mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const time = calculateTimeFromY(y)

    setMouseIndicator({
      visible: true,
      y,
      time,
    })
  }

  const handleMouseLeave = () => {
    setMouseIndicator({ visible: false, y: 0, time: '' })
  }

  return (
    <div className="flex h-full w-full">
      {/* Coluna de horários com largura responsiva baseada no estado da sidebar */}
      <div
        className={`border-r border-gray-300 dark:border-gray-50/20 shrink-0 transition-all duration-200 ${
          open ? 'w-20 sm:w-24' : 'w-16 sm:w-18'
        }`}
      >
        <div className="h-12"></div> {/* Espaço para header */}
        {timeSlots.map((time) => (
          <div
            key={time}
            className="border-b border-gray-300 dark:border-gray-50/10 flex items-start pt-2 pr-2 pl-1 sm:pl-3"
            style={{ height: `${getRowHeight(time)}px` }}
          >
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              {time}
            </span>
          </div>
        ))}
      </div>

      {/* Área principal com dias da semana */}
      <div className="flex-1 relative overflow-hidden">
        {/* Cabeçalho dos dias com bordas mais demarcadas */}
        <div className="h-12 border-b border-gray-300 dark:border-gray-50/20">
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

        {/* Grade de horários com linha de mouse */}
        <div
          className="relative"
          style={{
            height: `${timeSlots.reduce(
              (total, time) => total + getRowHeight(time),
              0
            )}px`,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Linhas de grade para horários */}
          {timeSlots.map((time) => (
            <div
              key={time}
              className="border-b border-gray-300 dark:border-gray-50/10 hover:bg-gray-50/20 transition-colors"
              style={{
                height: `${getRowHeight(time)}px`,
                zIndex: -1,
              }}
            ></div>
          ))}

          {/* Grid de colunas para os dias */}
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
          >
            {weekDays.map((_, index) => (
              <div
                key={index}
                className="border-r border-gray-300 dark:border-gray-50/20 last:border-r-0"
              />
            ))}
          </div>

          {/* Container para agendamentos usando grid */}
          <div
            className="absolute inset-0 grid gap-0"
            style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
          >
            {weekDays.map((date, index) => {
              const dayAppointments = appointments.filter(
                (apt) => apt.date === date.toISOString().split('T')[0]
              )

              return (
                <div
                  key={`appointments-${index}`}
                  className="relative h-full px-1"
                >
                  {/* Agendamentos empilhados para este dia */}
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

                      // Verificar se há agendamentos cancelados e ativos no mesmo horário
                      const cancelledAppointments = sameTimeAppointments.filter(
                        (apt) =>
                          ['cancelado', 'remarcado', 'no-show'].includes(
                            apt.status
                          )
                      )
                      const activeAppointments = sameTimeAppointments.filter(
                        (apt) =>
                          !['cancelado', 'remarcado', 'no-show'].includes(
                            apt.status
                          )
                      )

                      // Se há cancelados e ativos, empilhar verticalmente
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

                    // Posicionamento otimizado dentro das células da semana
                    const rowHeight = getRowHeight(appointment.time)
                    const verticalPadding = 8 // Padding aumentado para não grudar nas linhas
                    const cardSpacing = shouldStackVertically ? 8 : 8

                    // Altura base dos cards - maior quando sidebar está aberta
                    const baseHeightMultiplier = open ? 1.3 : 1
                    const maxCardHeightSingle = open ? 110 : 85
                    const maxCardHeightStacked = open ? 110 : 95

                    const baseCardHeight = shouldStackVertically
                      ? Math.min(
                          ((rowHeight - verticalPadding * 4) / 2) *
                            baseHeightMultiplier,
                          maxCardHeightStacked
                        )
                      : Math.min(
                          (rowHeight - verticalPadding * 2) *
                            baseHeightMultiplier,
                          maxCardHeightSingle
                        )

                    const minCardHeight = open ? 65 : 55

                    const cardHeight = shouldStackVertically
                      ? baseCardHeight
                      : Math.max(
                          baseCardHeight - columnPosition * 2,
                          minCardHeight
                        )

                    // Posicionamento horizontal corrigido para semana
                    const horizontalPadding = 3 // Padding para não grudar nas bordas
                    let leftPosition, cardWidth

                    if (shouldStackVertically) {
                      leftPosition = horizontalPadding
                      cardWidth = `calc(100% - ${horizontalPadding * 3}px)` // Cards empilhados usam largura total
                    } else {
                      if (
                        sameTimeAppointments.length > 1 &&
                        columnPosition === 1
                      ) {
                        // Segunda coluna lado a lado
                        leftPosition = '48%'
                        cardWidth = '50%'
                      } else {
                        // Primeira coluna ou único
                        leftPosition = horizontalPadding
                        cardWidth =
                          sameTimeAppointments.length > 1 &&
                          columnPosition === 0
                            ? '48%' // Primeira coluna quando tem duas
                            : `calc(100% - ${horizontalPadding * 2}px)` // Card único
                      }
                    }

                    const topOffset = shouldStackVertically
                      ? top +
                        verticalPadding +
                        columnPosition * (baseCardHeight + cardSpacing)
                      : top + verticalPadding + columnPosition * 4

                    const zIndex = 20 + columnPosition

                    return (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        isWeekView={true}
                        className="absolute"
                        style={{
                          top: `${topOffset}px`,
                          height: `${cardHeight}px`,
                          left:
                            typeof leftPosition === 'string'
                              ? leftPosition
                              : `${leftPosition}px`,
                          width: cardWidth,
                          zIndex: zIndex,
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

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
        </div>
      </div>
    </div>
  )
}
