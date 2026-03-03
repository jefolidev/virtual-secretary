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
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

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
  const hasUnread = notifications.some((n) => !n.readAt)

  const notificationsUntilFive = notifications.slice(0, 5)

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
      <DropdownMenuContent>
        <div className="p-2 border-b border-border flex justify-between items-center">
          <span className="text-sm font-medium">Notificações</span>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-green-500 transition-colors px-0 text-xs font-semibold"
          >
            <CheckCheck />
            Marcar todas como lidas{' '}
          </Button>
        </div>
        {notifications.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">
            Nenhuma notificação disponível
          </div>
        ) : (
          notificationsUntilFive.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex gap-2.5 py-2.5 px-2 my-2"
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
              <div className="flex items-center justify-center">
                <Button
                  className="rounded-full flex items-center justify-center p-0.5"
                  variant="ghost"
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
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
