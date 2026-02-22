import {
  Calendar,
  CalendarArrowUp,
  CalendarCheck2,
  CalendarClock,
  CalendarOff
} from 'lucide-react'
import type { AppointmentsSesions } from '../../../..'

function getIconStatusColor(status: AppointmentsSesions['status']) {
  if (status === 'COMPLETED') return 'text-green-500'
  if (status === 'CANCELLED') return 'text-red-500'
  if (status === 'RESCHEDULED') return 'text-blue-500'
  return 'text-orange-500'
}

export function StatusIcon({
  status,
}: {
  status: AppointmentsSesions['status']
}) {
  if (status === 'CANCELLED') {
    return <CalendarOff className={`w-4 h-4 ${getIconStatusColor(status)}`} />
  }

  if (status === 'RESCHEDULED') {
    return <CalendarClock className={`w-4 h-4 ${getIconStatusColor(status)}`} />
  }

  if (status === 'IN_PROGRESS') {
    return (
      <CalendarArrowUp className={`w-4 h-4 ${getIconStatusColor(status)}`} />
    )
  }

  if (status === 'SCHEDULED') {
    return <Calendar className={`w-4 h-4 ${getIconStatusColor(status)}`} />
  }

  return <CalendarCheck2 className={`w-4 h-4 ${getIconStatusColor(status)}`} />
}
