import { MapPin, Monitor, RefreshCw, Stethoscope } from 'lucide-react'
import type { AppointmentCardProps } from '../../types'
import { getStatusIcon, getStatusStyles } from '../../utils/status-utils'
import { CustomAppointmentBackground } from '../custom-appointment-background'

export function AppointmentCard({
  appointment,
  style,
  className = '',
  onClick,
  hasActiveSession = false,
}: AppointmentCardProps) {
  const styles = getStatusStyles(appointment.status)
  const StatusIcon = getStatusIcon(appointment.status)

  return (
    <CustomAppointmentBackground
      className={`${styles.bg} ${styles.text} ${className}`}
      style={style}
      variant="default"
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
              {appointment.patientName}
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
            {appointment.time}
            {appointment.endTime && ` — ${appointment.endTime}`}
          </span>
        </div>

        {/* Footer com tipo e modalidade */}
        <div className="pt-1 border-t border-gray-300/30 dark:border-gray-600/30">
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
              {appointment.type === 'consulta' ? (
                <Stethoscope className="h-2.5 w-2.5" />
              ) : (
                <RefreshCw className="h-2.5 w-2.5" />
              )}
              <span className="text-xs font-medium opacity-75 capitalize">
                {appointment.type}
              </span>
            </div>
            <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
              {appointment.modalidade === 'presencial' ? (
                <MapPin className="h-2.5 w-2.5" />
              ) : (
                <Monitor className="h-2.5 w-2.5" />
              )}
              <span className="text-xs font-medium opacity-75">
                {appointment.modalidade === 'presencial'
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
