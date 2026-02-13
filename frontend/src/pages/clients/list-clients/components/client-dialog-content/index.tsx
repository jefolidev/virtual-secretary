import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatCPF } from '@/utils/format-cpf'
import { formatPhoneNumber } from '@/utils/format-phone'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Calendar, Clock, File, Mail, Phone, User } from 'lucide-react'
import { isRegisteredContact } from '../../utils/is-user-registred'
import type { ClientCardProps } from '../client-card'

export function ClientDialogContent({ data }: ClientCardProps) {
  const isRegistered = isRegisteredContact(data)

  const now = new Date()
  const upcoming = isRegistered ? data.appointments : []

  const inCommingAppointment = upcoming
    .filter((a) => new Date(a.startDateTime).getTime() > now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    )

  const nextAppointment =
    inCommingAppointment.length > 0 ? inCommingAppointment[0] : null

  const past = isRegistered ? data.appointments : []

  const pastAppointments = past
    .filter((a) => new Date(a.startDateTime).getTime() <= now.getTime())
    .sort(
      (a, b) =>
        new Date(b.startDateTime).getTime() -
        new Date(a.startDateTime).getTime(),
    )
  const lastAppointment = past.length > 0 ? past[0] : null

  dayjs.extend(relativeTime)
  dayjs.locale('pt-br')

  const formatDateTimeWithRelative = (iso?: string | null) => {
    if (!iso) return null
    const d = dayjs(iso)
    return `${d.format('DD [de] MMMM [de] YYYY [às] HH:mm')} — ${d.fromNow()}`
  }

  return (
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader className="">
        <div className="flex gap-2.5 items-center">
          <Avatar className="size-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
            <AvatarBadge
              className={`bg-${isRegistered && data.whatsappContact.isOnline ? 'green' : 'red'}-600 dark:bg-${isRegistered && data.whatsappContact.isOnline ? 'green' : 'red'}-800`}
            />
          </Avatar>

          <div className="flex flex-col gap-2.5">
            <DialogTitle>
              {isRegistered ? data.user.name : data.nickname}
            </DialogTitle>
            <Badge>
              {isRegistered ? 'Paciente cadastrado' : 'Paciente não cadastrado'}
            </Badge>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex gap-1.5 items-center my-2">
          <User width={14} height={14} />
          <h1 className="text-sm font-semibold">Informações de Contato</h1>
        </div>

        <div className="bg-muted/30 rounded-md p-4 flex flex-col gap-3">
          <div className="flex flex-col">
            <div className="flex gap-2 items-center text-foreground/40">
              <Phone width={12} height={12} className="mt-0.5" />{' '}
              <span className="text-xs">Telefone</span>
            </div>
            <span className="text-sm pl-6">
              {isRegistered
                ? formatPhoneNumber(data.user.whatsappNumber)
                : formatPhoneNumber(data.whatsappNumber)}
            </span>
          </div>
          {isRegistered && (
            <>
              <Separator />
              <div className="flex flex-col">
                <div className="flex gap-2 items-center text-foreground/40">
                  <Mail width={12} height={12} className="mt-0.5" />{' '}
                  <span className="text-xs">Email</span>
                </div>
                <span className="text-sm pl-6">{data.user.email}</span>
              </div>
              <Separator />
              <div className="flex flex-col">
                <div className="flex gap-2 items-center text-foreground/40">
                  <File width={12} height={12} className="mt-0.5" />{' '}
                  <span className="text-xs">CPF</span>
                </div>
                <span className="text-sm pl-6">{formatCPF(data.user.cpf)}</span>
              </div>
            </>
          )}
        </div>

        {isRegistered && (
          <>
            <div className="flex gap-1.5 items-center my-2">
              <Calendar width={14} height={14} />
              <h1 className="text-sm font-semibold">Histórico de Consultas</h1>
            </div>
            <div className="bg-muted/30 rounded-md p-4 flex flex-col gap-3">
              <div className="flex flex-col">
                <div className="flex gap-2 items-center text-foreground/40">
                  <Calendar width={12} height={12} className="mt-0.5" />{' '}
                  <span className="text-xs">Agendamentos</span>
                </div>
                <span className="text-sm pl-6">
                  {data.appointments.length} agendamento
                  {data.appointments.length !== 1 && 's'}
                </span>
              </div>

              <Separator />

              <div className="flex flex-col gap-0.5">
                <div className="flex gap-2 items-center text-foreground/40">
                  <Clock width={12} height={12} className="mt-0.5" />{' '}
                  <span className="text-xs">Próxima</span>
                </div>
                <span className="text-sm pl-6">
                  {nextAppointment
                    ? formatDateTimeWithRelative(
                        nextAppointment.startDateTime.toString(),
                      )
                    : 'Nenhuma agendada'}
                </span>
                <p className="text-xs pl-6 text-muted-foreground">
                  {nextAppointment?.startDateTime.toString()
                    ? dayjs(nextAppointment.startDateTime).fromNow()
                    : ''}
                </p>
              </div>

              <Separator />

              <div className="flex flex-col gap-0.5">
                <div className="flex gap-2 items-center text-foreground/40">
                  <Calendar width={12} height={12} className="mt-0.5" />{' '}
                  <span className="text-xs">Último agendamento</span>
                </div>
                <span className="text-sm pl-6">
                  {lastAppointment
                    ? formatDateTimeWithRelative(
                        lastAppointment.startDateTime.toString(),
                      )
                    : 'Nenhum agendamento anterior'}
                </span>
                <p className="text-xs pl-6 text-muted-foreground">
                  {lastAppointment?.startDateTime.toString()
                    ? dayjs(lastAppointment.startDateTime).fromNow()
                    : ''}
                </p>
              </div>

              <Separator />

              <div className="flex flex-col  gap-0.5">
                <div className="flex gap-2 items-center text-foreground/40">
                  <User width={12} height={12} className="mt-0.5" />{' '}
                  <span className="text-xs">Última atividade</span>
                </div>
                <span className="text-sm pl-6">
                  {isRegistered && data.whatsappContact?.lastSeen
                    ? `${dayjs(data.whatsappContact.lastSeen).format('DD [de] MMMM [de] YYYY [às] HH:mm')}`
                    : 'Última atividade não disponível'}
                </span>
                <p className="text-xs pl-6 text-muted-foreground">
                  {isRegistered && data.whatsappContact?.lastSeen
                    ? dayjs(data.whatsappContact.lastSeen).fromNow()
                    : data.whatsappContact.lastSeen
                      ? dayjs(data.whatsappContact.lastSeen).fromNow()
                      : ''}
                </p>
              </div>
            </div>
          </>
        )}
        <div className="flex gap-1.5 items-center my-2">
          <File width={14} height={14} />
          <h1 className="text-sm font-semibold">Cadastro</h1>
        </div>

        <div className="bg-muted/30 rounded-md p-4 flex flex-col gap-3">
          <div className="flex flex-col  gap-0.5">
            <div className="flex gap-2 items-center text-foreground/40">
              <User width={12} height={12} className="mt-0.5" />{' '}
              <span className="text-xs">Cadastro</span>
            </div>
            <span className="text-sm pl-6">
              {isRegistered
                ? `${dayjs(data.whatsappContact.createdAt).format('DD [de] MMMM [de] YYYY [às] HH:mm')}`
                : 'Data de cadastro não disponível'}
            </span>
            <p className="text-xs pl-6 text-muted-foreground">
              {isRegistered
                ? dayjs(data.whatsappContact.createdAt).fromNow()
                : ''}
            </p>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
