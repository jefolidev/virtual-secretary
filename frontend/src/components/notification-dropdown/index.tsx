import { notificationServices } from '@/api/endpoints/notifications'
import type { NotificationType } from '@/api/endpoints/notifications/dto'
import { useNotifications } from '@/hooks/use-notifications'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  CalendarCheck2,
  CalendarMinus,
  Check,
  CheckCheck,
  DollarSign,
  Inbox,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

const FADE_DURATION = 400

function getNotificationIconByType(type: NotificationType) {
  switch (type) {
    case 'NEW_APPOINTMENT':
      return <CalendarCheck2 className="h-4 w-4" />
    case 'PAYMENT_STATUS':
      return <DollarSign className="h-4 w-4" />
    case 'CANCELLATION':
      return <CalendarMinus className="h-4 w-4" />
    case 'WELCOME':
      return <Inbox className="h-4 w-4" />
    default:
      return <Inbox className="h-4 w-4" />
  }
}

export function NotificationDropdown() {
  const notifications = useNotifications()
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const notificationsUntilFive = notifications
    .filter((n) => !n.readAt && !dismissedIds.has(n.id))
    .slice(0, 5)
  const visibleNotifications = notificationsUntilFive

  const hasUnread = notifications.some(
    (n) => !n.readAt && !dismissedIds.has(n.id),
  )

  const { readNotification } = notificationServices

  function fadeOut(ids: string[]) {
    setFadingIds((prev) => new Set([...prev, ...ids]))
    setTimeout(() => {
      setDismissedIds((prev) => new Set([...prev, ...ids]))
      setFadingIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
    }, FADE_DURATION)
  }

  const handleReadNotification = async (notificationId: string) => {
    fadeOut([notificationId])
    try {
      await readNotification(notificationId)
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const handleReadAllNotifications = async () => {
    const unreadIds = visibleNotifications
      .filter((n) => !n.readAt)
      .map((n) => n.id)
    fadeOut(unreadIds)
    try {
      await Promise.all(unreadIds.map((id) => readNotification(id)))
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error)
    }
  }

  const allNotificationsRead = visibleNotifications.every((n) => n.readAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-auto px-2">
          <Inbox className="h-4 w-4" />
          {hasUnread && (
            <span className="absolute top-[0.35px] mt-1 right-px h-1.25 w-1.25 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[300px]">
        <div className="p-2 border-b border-border flex justify-between items-center">
          <span className="text-sm font-medium">Notificações</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReadAllNotifications}
            disabled={allNotificationsRead || visibleNotifications.length === 0}
            className="hover:text-green-500 transition-colors px-0 text-xs font-semibold"
          >
            <CheckCheck />
            Marcar todas como lidas{' '}
          </Button>
        </div>
        <div className="min-h-[280px] flex flex-col items-center justify-start  ">
          {visibleNotifications.length === 0 ? (
            <span className="mt-6 text-xs flex items-center justify-center  text-muted-foreground">
              Nenhuma notificação disponível
            </span>
          ) : (
            visibleNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(e) => e.preventDefault()}
                className="flex gap-2.5 py-2.5 px-2 my-0.5 transition-opacity max-w-sm"
                style={{
                  opacity: fadingIds.has(notification.id) ? 0 : 1,
                  transitionDuration: `${FADE_DURATION}ms`,
                }}
              >
                <div className="p-1.5 mt-0.5 shrink-0 bg-foreground/10 shadow-lg rounded-full flex items-center justify-center ">
                  {getNotificationIconByType(notification.reminderType)}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-medium flex items-center gap-[0.25px]">
                    <p className="text-accent-foreground/60 text-xs">
                      {!notification.readAt && (
                        <span className="bg-red-500 w-1.5 h-1.5 rounded-full mr-2 inline-block"></span>
                      )}
                    </p>
                    {notification.title}
                  </span>

                  <span className="text-accent-foreground/60 text-xs">
                    {notification.content}
                  </span>
                  <span className="text-accent-foreground/40 text-xs">
                    {dayjs(notification.createdAt).fromNow()}
                  </span>
                </div>
                {!notification.readAt && (
                  <div className="flex items-center justify-center">
                    <Button
                      className="rounded-full flex items-center justify-center p-0.5"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReadNotification(notification.id)
                      }}
                      variant="ghost"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className=" py-2 border-t border-border flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-green-500 transition-colors "
          >
            <span className="text-xs font-semibold">
              Ver todas notificações
            </span>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
