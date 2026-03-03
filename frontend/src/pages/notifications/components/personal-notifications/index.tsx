import { useNotifications } from '@/hooks/use-notifications'
import { useState } from 'react'

import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

import type {
  Notification,
  NotificationType,
} from '@/api/endpoints/notifications/dto'
import { NotificationDayGroup } from '../notification-day-group'
import { NotificationFilters } from '../notification-filters'

dayjs.locale('pt-br')

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  NEW_APPOINTMENT: 'Novo agendamento',
  CANCELLATION: 'Cancelamento',
  CONFIRMATION: 'Confirmação',
  DAILY_SUMMARY: 'Resumo diário',
  CONFIRMED_LIST: 'Lista confirmada',
  PAYMENT_STATUS: 'Status de pagamento',
  USER_CONFIRMATION: 'Confirmação do paciente',
  CALENDAR_SYNC_UPDATED: 'Sincronização atualizada',
  CALENDAR_SYNC_CANCELLED: 'Sincronização cancelada',
}

const ALL_TYPES = Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]

const today = dayjs().format('YYYY-MM-DD')
const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

function groupByDay(notifications: Notification[]): [string, Notification[]][] {
  const map: Record<string, Notification[]> = {}
  for (const n of notifications) {
    const day = dayjs(n.createdAt).format('YYYY-MM-DD')
    if (!map[day]) map[day] = []
    map[day].push(n)
  }
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
}

function getDayLabel(day: string): string {
  if (day === today) return 'Hoje'
  if (day === yesterday) return 'Ontem'
  return dayjs(day).format('D [de] MMMM')
}

export function PersonalNotifications() {
  const notifications = useNotifications()
  const [selectedTypes, setSelectedTypes] = useState<Set<NotificationType>>(
    new Set(ALL_TYPES),
  )

  const filtered = notifications.filter((n) =>
    selectedTypes.has(n.reminderType as NotificationType),
  )
  const grouped = groupByDay(filtered)

  function toggleType(type: NotificationType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col py-4 col-span-2">
        {filtered.length === 0 ? (
          <span className="mt-6 text-sm flex items-center justify-center text-muted-foreground">
            Nenhuma notificação disponível
          </span>
        ) : (
          grouped.map(([day, items]) => (
            <NotificationDayGroup
              key={day}
              label={getDayLabel(day)}
              items={items}
            />
          ))
        )}
      </div>
      <NotificationFilters
        types={ALL_TYPES}
        labels={NOTIFICATION_TYPE_LABELS}
        selectedTypes={selectedTypes}
        onToggle={toggleType}
      />
    </div>
  )
}
