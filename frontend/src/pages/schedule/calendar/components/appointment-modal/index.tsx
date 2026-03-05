import { appointmentsServices } from '@/api/endpoints/appointments'
import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { Transaction } from '@/types/transaction'
import { formatFullAddress } from '@/utils/format-address'
import { formatCurrency } from '@/utils/format-currency'
import { formatPhoneNumber } from '@/utils/format-phone'
import { VideoCameraIcon } from '@phosphor-icons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
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
import { toast } from 'sonner'
import { getStatusIcon, getStatusStyles } from '../../utils/status-utils'
import { RescheduleModal } from './components/reschedule-modal'

interface AppointmentModalProps {
  schedule: FetchProfessionalSchedulesResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SessionTimer {
  isRunning: boolean
  isPaused: boolean
  startTime: Date | null
  elapsedTime: number // em segundos
}

const paymentStatusOptions: { value: string; label: string }[] = [
  { value: 'FAILED', label: 'Não Pago' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PROCESSING', label: 'Processando' },
  { value: 'SUCCEEDED', label: 'Pago' },
  { value: 'PAID', label: 'Pago' },
  { value: 'REFUNDED', label: 'Reembolsado' },
]

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

const paymentStatusColors: Record<string, string> = {
  PENDING: 'text-yellow-500',
  PROCESSING: 'text-yellow-500',
  SUCCEEDED: 'text-green-500',
  PAID: 'text-green-500',
  FAILED: 'text-gray-500',
  REFUNDED: 'text-gray-500',
}

const paymentStatusBgColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-yellow-500',
  SUCCEEDED: 'bg-green-500',
  PAID: 'bg-green-500',
  FAILED: 'bg-gray-500',
  REFUNDED: 'bg-gray-500',
}

export function AppointmentModal({
  schedule,
  open,
  onOpenChange,
}: AppointmentModalProps) {
  const {
    startAppointment,
    pauseAppointment,
    endAppointment,
    getAppointmentTransaction,
  } = appointmentsServices

  const [currentStatus, setCurrentStatus] =
    useState<Appointment['status']>('IN_PROGRESS')

  const [timer, setTimer] = useState<SessionTimer>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
  })
  const [lastAction, setLastAction] = useState<
    'start' | 'resume' | 'pause' | 'stop' | null
  >(null)

  // Query para buscar a transação do agendamento
  const { data: appointmentTransaction } = useQuery<Transaction | null>({
    queryKey: ['appointmentTransaction', schedule?.appointment.id],
    queryFn: async () => {
      if (!schedule?.appointment.id) return null
      try {
        return await getAppointmentTransaction(schedule.appointment.id)
      } catch (error) {
        console.error('Erro ao buscar transação:', error)
        return null
      }
    },
    enabled: !!schedule?.appointment.id && open,
    refetchOnWindowFocus: false,
  })

  // Mutation para iniciar/retomar agendamento
  const startAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return await startAppointment(appointmentId)
    },
    onSuccess: () => {
      if (!timer.isRunning) {
        setTimer({
          isRunning: true,
          isPaused: false,
          startTime: new Date(),
          elapsedTime: 0,
        })
        setLastAction('start')
        toast.success('Sessão iniciada')
      } else {
        setTimer((prev) => ({
          ...prev,
          isPaused: false,
          startTime: new Date(Date.now() - prev.elapsedTime * 1000),
        }))
        setLastAction('resume')
        toast.success('Sessão retomada')
      }
    },
    onError: () => {
      toast.error('Erro ao iniciar/retomar sessão')
    },
  })

  // Mutation para pausar agendamento
  const pauseAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return await pauseAppointment(appointmentId)
    },
    onSuccess: () => {
      setTimer((prev) => ({
        ...prev,
        isPaused: true,
      }))
      setLastAction('pause')
      toast.success('Sessão pausada')
    },
    onError: () => {
      toast.error('Erro ao pausar sessão')
    },
  })

  // Mutation para finalizar agendamento
  const endAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return await endAppointment(appointmentId)
    },
    onSuccess: () => {
      setTimer({
        isRunning: false,
        isPaused: false,
        startTime: null,
        elapsedTime: 0,
      })
      setLastAction('stop')
      toast.success('Sessão finalizada')
    },
    onError: () => {
      toast.error('Erro ao finalizar sessão')
    },
  })

  useEffect(() => {
    if (schedule?.appointment.status === 'IN_PROGRESS') {
      setTimer((prev) => ({
        ...prev,
        isRunning: true,
        startTime: schedule.appointment.startedAt
          ? new Date(schedule.appointment.startedAt)
          : null,
        elapsedTime: schedule.appointment.totalElapsedMs
          ? Math.floor(schedule.appointment.totalElapsedMs / 1000)
          : 0,
      }))
    }
  }, [schedule])

  useEffect(() => {
    if (schedule?.appointment.status) {
      setCurrentStatus(schedule.appointment.status)
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
    if (!schedule?.appointment.id) return

    // Verifica se o pagamento foi pago ou se está confirmado
    const isPaymentSucceeded =
      appointmentTransaction?.status === 'SUCCEEDED' ||
      appointmentTransaction?.status === 'PAID'
    const isConfirmed = schedule.appointment.status === 'CONFIRMED'

    if (!isPaymentSucceeded && !isConfirmed) {
      toast.error(
        'Não é possível iniciar a sessão. Aguarde a confirmação e o pagamento.',
      )
      return
    }

    if (!timer.isRunning || timer.isPaused) {
      // Iniciar ou retomar sessão
      startAppointmentMutation.mutate(schedule.appointment.id)
    } else {
      // Pausar sessão
      pauseAppointmentMutation.mutate(schedule.appointment.id)
    }
  }

  const handleStopSession = async () => {
    if (!schedule?.appointment.id) return
    endAppointmentMutation.mutate(schedule.appointment.id)
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
      console.log('Lembrete de pagamento enviado')
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error)
    }
  }

  const isPaymentPaid = schedule?.appointment.paymentStatus === 'SUCCEEDED'

  const isCompleted =
    currentStatus === 'COMPLETED' ||
    schedule?.appointment.status === 'COMPLETED'

  const isCanceled =
    currentStatus === 'CANCELLED' ||
    schedule?.appointment.status === 'CANCELLED' ||
    schedule.appointment.status === 'NO_SHOW' ||
    currentStatus === 'NO_SHOW'

  const completedElapsedSeconds = schedule?.appointment.totalElapsedMs
    ? Math.floor(schedule.appointment.totalElapsedMs / 1000)
    : timer.elapsedTime

  const canStartSession =
    (appointmentTransaction?.status === 'SUCCEEDED' ||
      appointmentTransaction?.status === 'PAID') &&
    schedule?.appointment.status === 'CONFIRMED'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-350 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold w-full">
            <div className="flex justify-between w-full">
              <div className="flex gap-2.5 items-center">
                <span className="text-base font-normal dark:text-zinc-200/50">
                  Agendamento
                </span>
                #
                {schedule?.appointment.id
                  ? schedule.appointment.id.slice(0, 8).toUpperCase()
                  : '-----'}
              </div>
              <div className="flex gap-2.5 items-center mr-6">
                <div className="flex gap-2.5 items-center">
                  <div
                    className={`h-1.5 w-1.75 rounded-full ${
                      appointmentTransaction?.status
                        ? paymentStatusBgColors[
                            appointmentTransaction.status
                          ] || 'bg-gray-500'
                        : 'bg-gray-500'
                    }`}
                  />
                  <Label
                    className={`text-base ${
                      appointmentTransaction?.status
                        ? paymentStatusColors[appointmentTransaction.status] ||
                          'text-gray-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {paymentStatusOptions.find(
                      (option) =>
                        option.value === appointmentTransaction?.status,
                    )?.label || 'Desconhecido'}
                  </Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon-sm" variant="ghost">
                      {' '}
                      <ChevronDown size={14} className="mt-0.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <header className="flex gap-2.5 items-center">
                      <CreditCard size="16" className="text-muted-foreground" />{' '}
                      <Label>Status do pagamento</Label>
                    </header>
                    <Separator className="mt-2.5 mb-3" />
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm text-accent-foreground/50">
                          Status atual:
                        </Label>
                        <Label className="text-sm font-medium ">
                          {paymentStatusOptions.find(
                            (option) =>
                              option.value === appointmentTransaction?.status,
                          )?.label || 'Desconhecido'}
                        </Label>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <Label className="text-sm text-accent-foreground/50">
                          Método de pagamento:
                        </Label>
                        <Label className="text-sm font-medium ">
                          {appointmentTransaction?.method === 'PIX'
                            ? 'Pix'
                            : appointmentTransaction?.method === 'CREDIT_CARD'
                              ? 'Cartão de Crédito'
                              : appointmentTransaction?.method === 'DEBIT_CARD'
                                ? 'Cartão de Débito'
                                : '---'}
                        </Label>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Label className="text-sm text-accent-foreground/50">
                          Valor:
                        </Label>
                        <Label className="text-sm font-medium ">
                          {appointmentTransaction
                            ? formatCurrency(appointmentTransaction.amount)
                            : '---'}
                        </Label>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Label className="text-sm text-accent-foreground/50">
                          Pago em:
                        </Label>
                        <Label className="text-sm font-medium ">
                          {appointmentTransaction?.paidAt
                            ? new Date(
                                appointmentTransaction.paidAt,
                              ).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                              })
                            : '---'}
                        </Label>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Label className="text-sm text-accent-foreground/50">
                          Gerado em:
                        </Label>
                        <Label className="text-sm font-medium ">
                          {appointmentTransaction?.createdAt
                            ? new Date(
                                appointmentTransaction.createdAt,
                              ).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : '---'}
                        </Label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
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

          <Separator />
          {/*Controles de Sessão */}
          <div className="p-2 items-center justify-center grid grid-cols-2">
            <div className="flex flex-col items-center gap-2">
              <div className="text-center">
                <p
                  className={`text-4xl font-sf font-medium ${isCanceled ? 'opacity-60' : ''}`}
                >
                  {isCompleted
                    ? formatTime(completedElapsedSeconds)
                    : formatTime(timer.elapsedTime)}
                </p>
                <p className="text-xs text-muted-foreground mt-2.5">
                  {isCompleted ? 'Duração da sessão' : 'Tempo de sessão'}
                </p>
                {isCompleted && (
                  <p className="text-sm text-green-600 mt-2">
                    Sessão concluída
                  </p>
                )}
                {isCanceled && (
                  <p className="text-xs text-red-600 mt-2 max-w-40 ">
                    Sessão indisponível por ausência ou cancelamento
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isCompleted && !isCanceled ? (
                  <Button
                    onClick={handleStartSession}
                    variant={
                      timer.isRunning && !timer.isPaused
                        ? 'secondary'
                        : 'default'
                    }
                    disabled={
                      isCompleted ||
                      isCanceled ||
                      !canStartSession ||
                      startAppointmentMutation.isPending ||
                      pauseAppointmentMutation.isPending
                    }
                    className="rounded-full"
                  >
                    {timer.isRunning && !timer.isPaused ? (
                      lastAction === 'resume' ? (
                        <Pause />
                      ) : (
                        <>
                          <Pause /> Pausar
                        </>
                      )
                    ) : (
                      <>
                        <Play className="" />{' '}
                      </>
                    )}
                  </Button>
                ) : (
                  <RescheduleModal clientId={schedule?.appointment.clientId} />
                )}
                {timer.isRunning && !isCompleted && (
                  <Button
                    onClick={handleStopSession}
                    variant="destructive"
                    className="rounded-full"
                    disabled={endAppointmentMutation.isPending}
                  >
                    <Square className="" />
                  </Button>
                )}
              </div>
              {!canStartSession && !isCompleted && !isCanceled && (
                <p className="text-xs text-amber-600 mt-2 text-center max-w-xs">
                  Aguardando confirmação e pagamento para iniciar a sessão
                </p>
              )}
              {schedule.appointment.status === 'SCHEDULED' ||
                (schedule.appointment.status === 'CONFIRMED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNoShow}
                    className="text-red-600 hover:text-red-700 w-full max-w-xs"
                  >
                    <UserX className="h-4 w-4 mr-2" /> Paciente ausente
                  </Button>
                ))}
            </div>
            <div className="m-auto justify-center  items-center">
              {/* Modalidade */}
              <div className="flex p-3 gap-2.5">
                <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                  {schedule?.appointment.modality === 'IN_PERSON' ? (
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
                    {schedule?.appointment.modality === 'IN_PERSON'
                      ? 'Presencial'
                      : 'Online'}
                  </p>
                </div>
              </div>

              {schedule?.appointment.modality === 'ONLINE' && (
                <div className="flex p-3 gap-2.5">
                  <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                    <VideoCameraIcon
                      className="h-5 w-5 text-zinc-600"
                      weight="bold"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Link
                    </p>
                    <a
                      href={schedule?.appointment.googleMeetLink || ''}
                      className="font-semibold text-xs text-blue-600 hover:text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Acessar reunião
                    </a>
                  </div>
                </div>
              )}

              {/* Data e Horário */}
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">
                    Data/Horário
                  </p>
                  <p className="font-semibold text-xs">
                    {new Date(
                      schedule?.appointment.startDateTime,
                    ).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs">
                    {new Date(
                      schedule?.appointment.startDateTime,
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(
                      schedule?.appointment.endDateTime,
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
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
                    {formatFullAddress({
                      addressLine1: schedule.address.props.addressLine1,
                      addressLine2: schedule.address.props.addressLine2 || '',
                      neighborhood: schedule.address.props.neighborhood,
                      city: schedule.address.props.city,
                      state: schedule.address.props.state,
                      postalCode: schedule.address.props.postalCode,
                      country: 'Brasil',
                      organizationId: null,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
