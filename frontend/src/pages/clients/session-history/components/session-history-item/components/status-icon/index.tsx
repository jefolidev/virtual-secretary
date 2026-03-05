import {
  Calendar,
  CalendarArrowUp,
  CalendarCheck2,
  CalendarClock,
  CalendarOff,
} from 'lucide-react'

export function StatusIcon({ status }: { status: string }) {
  const className = 'w-4 h-4 dark:text-neutral-100 text-neutral-700'

  if (status === 'CANCELLED') {
    return <CalendarOff className={className} />
  }

  if (status === 'RESCHEDULED') {
    return <CalendarClock className={className} />
  }

  if (status === 'IN_PROGRESS') {
    return <CalendarArrowUp className={className} />
  }

  if (status === 'SCHEDULED') {
    return <Calendar className={className} />
  }

  return <CalendarCheck2 className={className} />
}
