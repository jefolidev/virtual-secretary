import type { Notification } from '@/api/endpoints/notifications/dto'
import { getNotificationIconByType } from '@/components/notification-dropdown'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { ReactNode } from 'react'

import 'dayjs/locale/pt-br'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

function parseContent(content: string): ReactNode {
  const match = content.match(
    /^(O paciente )(.+?)( agendou uma consulta para )(\d{2}\/\d{2}\/\d{4})( às )(\d{2}:\d{2})(\.?)$/,
  )

  if (match) {
    const [, pre, name, mid, date, ats, time, post] = match
    return (
      <>
        {pre}
        <span className="font-semibold text-foreground">{name}</span>
        {mid}
        <span className="font-semibold text-foreground">{date}</span>
        {ats}
        <span className="font-semibold text-foreground">{time}</span>
        {post}
      </>
    )
  }

  return content
}

export interface NotificationItemProps {
  notification: Notification
  isLast?: boolean
}

export function NotificationItem({ notification, isLast }: NotificationItemProps) {
  const { reminderType, content, title, createdAt, readAt } = notification

  const icon = getNotificationIconByType(reminderType)

  return (
    <div className="flex gap-3 px-2 my-1">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div className="p-2.5 bg-foreground/10 shadow-lg rounded-full flex items-center justify-center z-10">
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-4" />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-0.5 w-full ${isLast ? 'pb-0' : 'pb-4'}`}>
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-semibold">{title}</span>
            <p className="text-[8px] mt-px text-muted-foreground">
              {dayjs(createdAt).fromNow()}
            </p>
          </div>
          {!readAt && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />}
        </div>
        <span className="text-sm text-muted-foreground">
          {parseContent(content)}
        </span>
      </div>
    </div>
  )
}
