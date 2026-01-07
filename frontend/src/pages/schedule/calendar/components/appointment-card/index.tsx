import { MapPin, Monitor, RefreshCw, Stethoscope } from 'lucide-react'
import type { AppointmentCardProps } from '../../types'
import { getStatusIcon, getStatusStyles } from '../../utils/status-utils'

export function AppointmentCard({
  appointment,
  isWeekView = false,
  style,
  className = '',
}: AppointmentCardProps) {
  const styles = getStatusStyles(appointment.status)
  const StatusIcon = getStatusIcon(appointment.status)

  return (
    <div
      className={`rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden ${styles.bg} ${styles.text} ${className}`}
      style={{
        ...style,
        boxSizing: 'border-box',
        overflow: 'hidden',
        minWidth: 0,
        maxWidth: '100%',
        padding: isWeekView ? '8px' : '12px',
        margin: '3px 0', // Margem vertical aumentada para não grudar nas linhas
      }}
    >
      {/* Nome do paciente com ícone à esquerda e status à direita */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Ícone em quadradinho */}
          <div
            className={`w-5 h-5 rounded ${styles.iconBg} flex items-center justify-center shrink-0`}
          >
            <StatusIcon className="h-3 w-3 text-white" />
          </div>
          {/* Nome do paciente */}
          <div
            className={`font-semibold ${
              isWeekView ? 'text-xs' : 'text-sm'
            } leading-tight truncate`}
          >
            {appointment.patientName}
          </div>
        </div>
        {/* Status no canto direito */}
        <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${styles.dotColor}`}></div>
          <span
            className={`${
              isWeekView ? 'text-xs' : 'text-xs'
            } font-medium opacity-75 truncate`}
          >
            {styles.label}
          </span>
        </div>
      </div>

      {/* Horário */}
      <div className={`flex gap-2 ${isWeekView ? 'ml-5' : 'ml-6'} mb-2`}>
        <span
          className={`${
            isWeekView ? 'text-xs' : 'text-sm'
          } font-medium text-zinc-600 dark:text-zinc-300 truncate`}
        >
          {appointment.time} — {appointment.endTime}
        </span>
      </div>

      {/* Footer com tipo e modalidade */}
      <div className=" pt-1 border-t border-gray-300/30 dark:border-gray-600/30">
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
            {appointment.type === 'consulta' ? (
              <Stethoscope className="h-2.5 w-2.5" />
            ) : (
              <RefreshCw className="h-2.5 w-2.5" />
            )}
            <span
              className={`${
                isWeekView ? 'text-xs' : 'text-xs'
              } font-medium opacity-75 capitalize`}
            >
              {appointment.type}
            </span>
          </div>
          <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
            {appointment.modalidade === 'presencial' ? (
              <MapPin className="h-2.5 w-2.5" />
            ) : (
              <Monitor className="h-2.5 w-2.5" />
            )}
            <span
              className={`${
                isWeekView ? 'text-xs' : 'text-xs'
              } font-medium opacity-75`}
            >
              {appointment.modalidade === 'presencial'
                ? 'Presencial'
                : 'Remota'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
