import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  BadgeCheck,
  BadgeX,
  Calendar,
  Clock,
  File,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { ClientDialogContent } from '../client-dialog-content'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

export interface ClientCardProps {
  data: {
    name: string
    email: string
    phone: string
    cpf: string

    appointments: Appointment[]
    lastActivity?: Date
    createdAt?: string | Date

    isOnline: boolean
    isRegistered: boolean
  }
}
export function ClientCard({
  data: {
    name,
    email,
    phone,
    cpf,
    appointments,
    lastActivity,
    isOnline,
    isRegistered,
  },
}: ClientCardProps) {
  const [open, setOpen] = useState(false)
  const now = new Date()
  const upcoming = appointments
    .filter((a) => new Date(a.startDateTime).getTime() > now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    )
  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
          className={`border-gray-300 dark:border-gray-50/20 flex flex-col gap-2 p-5 rounded-md border justify-center hover:cursor-pointer hover:bg-muted/10 transition-colors transform-gpu will-change-transform `}
        >
          {/* Header */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col items-center justify-center gap-2">
              <Avatar className="size-12">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
                <AvatarBadge
                  className={`bg-${isOnline ? 'green' : 'red'}-600 dark:bg-${isOnline ? 'green' : 'red'}-800`}
                />
              </Avatar>

              <h1 className="font-medium text-lg">{name}</h1>

              <Badge variant={'outline'}>
                {isRegistered ? (
                  <BadgeCheck data-icon="inline-start" />
                ) : (
                  <BadgeX data-icon="inline-start" />
                )}
                {isRegistered ? 'Cadastrado' : 'Não Cadastrado'}
              </Badge>
            </div>

            {/* Content */}
            <div
              className={`flex flex-col gap-2 my-2 justify-center ${!isRegistered && 'my-4'}`}
            >
              {isRegistered && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Mail width={13} height={13} /> {email}
                </div>
              )}
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Phone width={13} height={13} /> {phone}
              </div>
              {!isRegistered && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Clock width={13} height={13} />{' '}
                  {lastActivity
                    ? `Última atividade: ${dayjs(lastActivity).fromNow()}`
                    : 'Sem atividade registrada'}
                </div>
              )}
              {isRegistered && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <File width={13} height={13} /> {cpf}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Separator className={`${isRegistered ? '' : ''}`} />

            {/* Footer */}
            {isRegistered ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground my-1">
                  <Calendar width={13} height={13} /> {appointments.length}{' '}
                  agendamento{appointments.length !== 1 && 's'}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground my-1">
                  <Clock width={13} height={13} /> Próxima:{' '}
                  {nextAppointment
                    ? dayjs(nextAppointment.startDateTime).fromNow()
                    : 'Nenhuma agendada'}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs my-1 text-orange-400">
                <User width={12} height={12} /> Aguardando cadastro
              </div>
            )}
          </div>
        </div>
      </DialogTrigger>

      <ClientDialogContent
        data={{
          name,
          email,
          phone,
          cpf,
          appointments,
          lastActivity,
          isOnline,
          isRegistered,
        }}
      />
    </Dialog>
  )
}
