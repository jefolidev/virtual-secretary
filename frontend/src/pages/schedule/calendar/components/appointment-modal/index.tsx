import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type {
  Appointment,
  FetchProfessionalSchedulesSchema,
} from '@/services/professional/dto/fetch-professional-schedules.dto'
import { formatFullAddress } from '@/utils/format-address'
import { formatPhoneNumber } from '@/utils/format-phone'
import {
  Bell,
  Clock,
  CreditCard,
  MapPin,
  Monitor,
  Pause,
  Play,
  Square,
  UserX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getStatusIcon, getStatusStyles } from '../../utils/status-utils'

interface AppointmentModalProps {
  schedule: FetchProfessionalSchedulesSchema | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SessionTimer {
  isRunning: boolean
  isPaused: boolean
  startTime: Date | null
  elapsedTime: number // em segundos
}

const statusOptions = [
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'SUCCEEDED', label: 'Pago' },
  { value: 'COMPLETED', label: 'Finalizado' },
  { value: 'FAILED', label: 'Não Pago' },
  { value: 'NO_SHOW', label: 'No Show' },
  { value: 'RESCHEDULED', label: 'Remarcado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export function AppointmentModal({
  schedule,
  open,
  onOpenChange,
}: AppointmentModalProps) {
  const [currentStatus, setCurrentStatus] =
    useState<Appointment['status']>('IN_PROGRESS')

  console.log('[]', schedule)

  const [timer, setTimer] = useState<SessionTimer>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
  })

  useEffect(() => {
    if (schedule?.appointments?.status) {
      setCurrentStatus(schedule?.appointments?.status)
    }
  }, [schedule])

  useEffect(() => {
    let interval: number
    if (timer.isRunning && !timer.isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => ({
          ...prev,
          elapsedTime: prev.startTime
            ? Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
            : prev.elapsedTime + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer.isRunning, timer.isPaused])

  if (!schedule) return null

  const styles = getStatusStyles(currentStatus as Appointment['status'])
  const StatusIcon = getStatusIcon(currentStatus as Appointment['status'])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartSession = async () => {
    if (!timer.isRunning) {
      // Iniciar sessão
      try {
        // await fetch(`/sessions/${appointment.id}/start`, { method: 'POST' })
        setTimer({
          isRunning: true,
          isPaused: false,
          startTime: new Date(),
          elapsedTime: 0,
        })
      } catch (error) {
        console.error('Erro ao iniciar sessão:', error)
      }
    } else if (timer.isPaused) {
      // Retomar sessão
      try {
        // await fetch(`/sessions/${appointment.id}/start`, { method: 'POST' })
        setTimer((prev) => ({
          ...prev,
          isPaused: false,
          startTime: new Date(Date.now() - prev.elapsedTime * 1000),
        }))
      } catch (error) {
        console.error('Erro ao retomar sessão:', error)
      }
    } else {
      // Pausar sessão
      try {
        // await fetch(`/sessions/${appointment.id}/pause`, { method: 'POST' })
        setTimer((prev) => ({
          ...prev,
          isPaused: true,
        }))
      } catch (error) {
        console.error('Erro ao pausar sessão:', error)
      }
    }
  }

  const handleStopSession = async () => {
    try {
      // await fetch(`/sessions/${appointment.id}/stop`, { method: 'POST' })
      setTimer({
        isRunning: false,
        isPaused: false,
        startTime: null,
        elapsedTime: 0,
      })
    } catch (error) {
      console.error('Erro ao parar sessão:', error)
    }
  }

  const handleNoShow = async () => {
    try {
      setCurrentStatus('NO_SHOW')
      // await updateStatus('no-show')
    } catch (error) {
      console.error('Erro ao marcar no-show:', error)
    }
  }

  const handleSendPaymentReminder = async () => {
    try {
      // await fetch(`/payments/${schedule.accountId}/reminder`, { method: 'POST' })
      console.log('Lembrete de pagamento enviado')
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error)
    }
  }

  const isPaymentPaid = schedule?.appointments?.paymentStatus === 'SUCCEEDED'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold ">
            <span className="text-base font-normal dark:text-zinc-200/50">
              Agendamento
            </span>
            #
            {schedule?.appointments?.id
              ? schedule.appointments.id.slice(0, 8).toUpperCase()
              : '-----'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header - Nome e Status */}
          <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}
              >
                <StatusIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">Paciente</p>
                <h2 className="text-xl font-semibold">{schedule.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">Status</p>
              <Select
                value={currentStatus}
                onValueChange={(value) =>
                  setCurrentStatus(value as Appointment['status'])
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Grid de colunas - Modalidade e Data/Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modalidade */}
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                {schedule?.appointments?.modality === 'IN_PERSON' ? (
                  <MapPin className="h-5 w-5 text-zinc-600" />
                ) : (
                  <Monitor className="h-5 w-5 text-zinc-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Modalidade
                </p>
                <p className="font-semibold capitalize">
                  {schedule?.appointments?.modality === 'IN_PERSON'
                    ? 'Presencial'
                    : 'Online'}
                </p>
              </div>
            </div>

            {/* Data e Horário */}
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Data/Horário
                </p>
                <p className="font-semibold">
                  {new Date(
                    schedule?.appointments?.startDateTime,
                  ).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm">
                  {new Date(
                    schedule?.appointments?.startDateTime,
                  ).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(
                    schedule?.appointments?.endDateTime,
                  ).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>{' '}
          {/* FIM DO GRID */}
          <Separator />
          {/* Seção de Pagamento */}
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <p className="font-semibold">
                      Conta: {schedule?.appointments?.currentTransactionId}
                    </p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const lastFirstReminder = schedule?.notification
                          ?.filter((n) => n.reminderType === 'FIRST_REMINDER')
                          // Ordena da mais nova para a mais antiga baseado no createdAt
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime(),
                          )[0]

                        if (!lastFirstReminder) return null

                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Último lembrete:{' '}
                              {new Date(
                                lastFirstReminder.createdAt,
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  <Badge variant={isPaymentPaid ? 'default' : 'destructive'}>
                    {isPaymentPaid ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isPaymentPaid}
                onClick={handleSendPaymentReminder}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Enviar Lembrete
              </Button>
            </div>
          </div>
          <Separator />
          {/* Informações do Paciente */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Informações do Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Telefone:
                  </span>
                  <span className="text-base">
                    {formatPhoneNumber(schedule.whatsappNumber)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Email:
                  </span>
                  <span className="text-base">{schedule.email}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Gênero:
                  </span>
                  <span className="text-base">
                    {schedule.gender === 'MALE' ? 'Masculino' : 'Feminino'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Endereço:
                  </span>
                  <span className="text-[13.5px]">
                    {formatFullAddress(schedule.address.props)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Separator />
          {/* Footer - Controles de Sessão */}
          <div className="bg-muted/10 p-4 rounded-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">
                  {formatTime(timer.elapsedTime)}
                </p>
                <p className="text-xs text-muted-foreground">Tempo de sessão</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleStartSession}
                  variant={
                    timer.isRunning && !timer.isPaused ? 'secondary' : 'default'
                  }
                >
                  {timer.isRunning && !timer.isPaused ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />{' '}
                      {timer.isPaused ? 'Retomar' : 'Iniciar'} Sessão
                    </>
                  )}
                </Button>
                {timer.isRunning && (
                  <Button onClick={handleStopSession} variant="destructive">
                    <Square className="h-4 w-4 mr-2" /> Parar
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNoShow}
                className="text-red-600 hover:text-red-700 w-full max-w-xs"
              >
                <UserX className="h-4 w-4 mr-2" /> Paciente ausente
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
