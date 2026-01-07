import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { DayCardProps } from '../../types'
import { formatDate, isSameDay } from '../../utils'
import { getStatusStyles } from '../../utils/status-utils'

export function DayCard({
  date,
  appointments,
  viewMode,
  isCurrentMonth = true,
}: DayCardProps) {
  const today = new Date()
  const isToday = isSameDay(date, today)
  const isPastDate = date < today && !isToday

  const dayAppointments = appointments.filter(
    (apt) => apt.date === date.toISOString().split('T')[0]
  )

  const getCardSize = () => {
    switch (viewMode) {
      case 'day':
        return 'min-h-[400px] w-full'
      case 'week':
        return 'min-h-[200px] w-full'
      case 'month':
        return 'min-h-[120px] w-full aspect-square'
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
        className={`p-3 h-full flex flex-col overflow-hidden ${
          viewMode === 'month' ? 'p-2' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span
            className={`
              ${viewMode === 'month' ? 'text-sm' : 'text-base'} font-medium
              ${isToday ? 'text-primary font-bold' : ''}
              ${isPastDate ? 'text-muted-foreground' : ''}
            `}
          >
            {formatDate(date, 'day')}
          </span>
          {dayAppointments.length > 0 && (
            <span className="text-xs text-muted-foreground bg-primary/10 px-1 rounded">
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
              {dayAppointments
                .slice(0, viewMode === 'month' ? 3 : dayAppointments.length)
                .map((apt) => {
                  const styles = getStatusStyles(apt.status)
                  return (
                    <div
                      key={apt.id}
                      className={`
                      ${
                        viewMode === 'month' ? 'p-1 text-xs' : 'p-2 text-sm'
                      } rounded border-l-2 overflow-hidden
                      ${styles.bg}  ${styles.text}
                    `}
                    >
                      <div className="font-medium truncate">
                        {apt.patientName}
                      </div>
                      <div
                        className={`opacity-75 flex items-center gap-1 ${
                          viewMode === 'month' ? 'text-xs' : 'text-sm'
                        }`}
                      >
                        <Clock
                          className={`${
                            viewMode === 'month' ? 'h-3 w-3' : 'h-4 w-4'
                          }`}
                        />
                        {apt.time}
                      </div>

                      {(viewMode === 'day' || viewMode === 'week') && (
                        <div className="text-xs opacity-75 mt-1">
                          {styles.label}
                        </div>
                      )}
                    </div>
                  )
                })}
              {viewMode === 'month' && dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded p-1">
                  +{dayAppointments.length - 3} mais
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
