import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { DayCardProps } from '../../types'
import { formatDate, isSameDay } from '../../utils'
import { getStatusStyles } from '../../utils/status-utils'

export function DayCard({
  date,
  schedules: appointments,
  viewMode,
  isCurrentMonth = true,
}: DayCardProps) {
  const today = new Date()
  const isToday = isSameDay(date, today)
  const isPastDate = date < today && !isToday

  const dayAppointments = (appointments || [])
    .filter((apt) => {
      // 1. Criamos um objeto Date a partir da string do agendamento
      const aptDate = new Date(apt.appointments.startDateTime)

      // 2. Comparamos se é o mesmo dia, mês e ano
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      )
    })
    .sort((a, b) => {
      // 3. Ordenação: Convertemos para timestamp (número) para subtrair
      const timeA = new Date(a.appointments.startDateTime).getTime()
      const timeB = new Date(b.appointments.startDateTime).getTime()
      return timeA - timeB
    })

  const displayAppointments = dayAppointments.slice(0, 2) // Apenas os 2 primeiros
  const remainingCount = Math.max(0, dayAppointments.length - 2)

  const getCardSize = () => {
    switch (viewMode) {
      case 'day':
        return 'min-h-[400px] w-full'
      case 'week':
        return 'min-h-[200px] w-full'
      case 'month':
        return 'min-h-[140px] w-full aspect-square' // Aumentar altura para acomodar cards melhorados
      default:
        return 'h-20'
    }
  }

  return (
    <Card
      className={`
        ${getCardSize()}
        cursor-pointer hover:shadow-md transition-shadow
        ${isToday ? 'ring-2 ring-primary' : ''}
        ${isPastDate ? 'opacity-60' : ''}
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${dayAppointments.length > 0 ? 'border-primary/20 bg-primary/5' : ''}
      `}
    >
      <CardContent
        className={`h-full flex flex-col overflow-hidden ${
          viewMode === 'month' ? 'px-2 -my-2 ' : 'p-3'
        }`}
      >
        <div className="flex items-center justify-between mb-1 shrink-0">
          <span
            className={`
              ${
                viewMode === 'month'
                  ? 'text-base font-bold'
                  : 'text-base font-medium'
              } 
              ${isToday ? 'text-primary font-bold text-lg' : ''}
              ${isPastDate ? 'text-muted-foreground' : 'text-foreground'}
            `}
          >
            {formatDate(date, 'day')}
          </span>
          {dayAppointments.length > 0 && (
            <span className="text-xs text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded">
              {dayAppointments.length}
            </span>
          )}
        </div>

        {dayAppointments.length > 0 ? (
          <div className="flex-1 overflow-hidden">
            <div
              className={`space-y-1 ${
                viewMode === 'day' || viewMode === 'week'
                  ? 'max-h-full overflow-y-auto'
                  : ''
              }`}
            >
              {(viewMode === 'month'
                ? displayAppointments
                : dayAppointments
              ).map((apt) => {
                const styles = getStatusStyles(apt.appointments.status)
                const isPaid = apt.appointments.paymentStatus === 'SUCCEEDED'
                const isNotPaid = apt.appointments.paymentStatus === 'PENDING'

                return (
                  <div
                    key={apt.appointments.id}
                    className={`
                      ${
                        viewMode === 'month'
                          ? 'px-2.5 py-1.5 text-xs rounded-md'
                          : 'p-2 text-sm rounded border-l-2'
                      } overflow-hidden transition-colors
                      ${
                        viewMode === 'month'
                          ? 'bg-card border border-border'
                          : `${styles.bg} ${styles.border}`
                      } 
                      ${viewMode === 'month' ? 'text-foreground' : styles.text}
                    `}
                  >
                    <div className="font-medium truncate">{apt.name}</div>
                    <div
                      className={`opacity-80 flex items-center justify-between gap-1 ${
                        viewMode === 'month' ? 'text-xs' : 'text-sm'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock
                          className={`${
                            viewMode === 'month' ? 'h-3 w-3' : 'h-4 w-4'
                          }`}
                        />
                        {apt.appointments.startDateTime
                          .toString()
                          .slice(11, 16)}
                      </div>
                    </div>

                    <div
                      className={`text-xs opacity-75 mt-1 ${
                        viewMode === 'month' ? 'text-xs' : ''
                      }`}
                    >
                      {styles.label}
                    </div>
                  </div>
                )
              })}
              {viewMode === 'month' && remainingCount > 0 && (
                <div className="text-xs text-muted-foreground text-center bg-muted/30 border border-muted rounded-md p-2 font-medium">
                  +{remainingCount} agendamento{remainingCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span
              className={`text-muted-foreground ${
                viewMode === 'month' ? 'text-xs' : 'text-sm'
              }`}
            >
              Sem agendamentos
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
