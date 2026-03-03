import type { Notification } from '@/api/endpoints/notifications/dto'
import { NotificationItem } from '../notification-item'

interface NotificationDayGroupProps {
  label: string
  items: Notification[]
}

export function NotificationDayGroup({
  label,
  items,
}: NotificationDayGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-3 px-2 mb-4.5 my-3">
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {items.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  )
}
