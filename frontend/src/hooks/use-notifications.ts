import { notificationServices } from '@/api/endpoints/notifications'
import type { Notification } from '@/api/endpoints/notifications/dto'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const POLL_INTERVAL_MS = 10_000

function getToastMessage(n: Notification) {
  if (n.reminderType === 'CALENDAR_SYNC_CANCELLED') {
    return { title: n.title, description: n.content, type: 'warning' as const }
  }
  if (n.reminderType === 'CALENDAR_SYNC_UPDATED') {
    return { title: n.title, description: n.content, type: 'info' as const }
  }
  return { title: n.title, description: n.content, type: 'message' as const }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const knownIds = useRef<Set<string>>(new Set())
  const isFirstPoll = useRef(true)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const fetched = await notificationServices.fetchNotifications({
          limit: 50,
        })

        if (cancelled) return

        setNotifications(fetched)

        const unread = fetched.filter((n) => !n.readAt)

        if (isFirstPoll.current) {
          // On first load, register all existing unread as known (no toast)
          unread.forEach((n) => knownIds.current.add(n.id))
          isFirstPoll.current = false
          return
        }

        for (const n of unread) {
          if (!knownIds.current.has(n.id)) {
            knownIds.current.add(n.id)
            const msg = getToastMessage(n)

            if (msg.type === 'warning') {
              toast.warning(msg.title, { description: msg.description })
            } else if (msg.type === 'info') {
              toast.info(msg.title, { description: msg.description })
            } else {
              toast(msg.title, { description: msg.description })
            }
          }
        }
      } catch {
        // Ignore errors (e.g. when not authenticated)
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return notifications
}
