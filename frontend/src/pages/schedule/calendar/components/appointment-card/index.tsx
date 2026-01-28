import { MapPin, Monitor, RefreshCw, Stethoscope } from 'lucide-react'
import type { AppointmentCardProps } from '../../types'
import { getStatusIcon, getStatusStyles } from '../../utils/status-utils'
import { CustomAppointmentBackground } from '../custom-appointment-background'

export function AppointmentCard({
  schedule,
  style,
  className = '',
  onClick,
  hasActiveSession = false,
}: AppointmentCardProps) {
  const styles = getStatusStyles(schedule.appointments.status)
  const StatusIcon = getStatusIcon(schedule.appointments.status)

  const startDate = new Date(schedule.appointments.startDateTime)
  const endDate = schedule.appointments.endDateTime
    ? new Date(schedule.appointments.endDateTime)
    : null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <CustomAppointmentBackground
    className={`rounded-md border p-1 ${styles.bg} ${styles.text} ${className}`}
    style={style}
    onClick={onClick}
  >
      <div className="relative h-full w-full p-2">
        {/* Indicador de sessão ativa */}
        {hasActiveSession && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-10" />
        )}

        {/* Nome do paciente com ícone à esquerda e status à direita */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Ícone em quadradinho */}
            <div
              className={`w-4 h-4 rounded ${styles.iconBg} flex items-center justify-center shrink-0`}
            >
              <StatusIcon className="h-2.5 w-2.5 text-white" />
            </div>
            {/* Nome do paciente */}
            <div className="font-semibold text-sm leading-tight truncate">
              {schedule.name}
            </div>
          </div>
          {/* Status no canto direito */}
          <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
            <div className={`w-2 h-2 rounded-full ${styles.dotColor}`}></div>
            <span className="text-xs font-medium opacity-75 truncate">
              {styles.label}
            </span>
          </div>
        </div>

        {/* Horário */}
        <div className="flex gap-2 ml-5 mb-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 truncate">
            {formatTime(startDate)}
            {endDate && ` — ${formatTime(endDate)}`}
          </span>
        </div>

        {/* Footer com tipo e modalidade */}
        <div className="pt-1 border-t border-gray-300/30 dark:border-gray-600/30">
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
              {schedule.appointments.modality === 'IN_PERSON' ? (
                <Stethoscope className="h-2.5 w-2.5" />
              ) : (
                <RefreshCw className="h-2.5 w-2.5" />
              )}
              <span className="text-xs font-medium opacity-75 capitalize">
                {schedule.appointments.modality}
              </span>
            </div>
            <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
              {schedule.appointments.modality === 'IN_PERSON' ? (
                <MapPin className="h-2.5 w-2.5" />
              ) : (
                <Monitor className="h-2.5 w-2.5" />
              )}
              <span className="text-xs font-medium opacity-75">
                {schedule.appointments.modality === 'IN_PERSON'
                  ? 'Presencial'
                  : 'Remota'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CustomAppointmentBackground>
  )
}
