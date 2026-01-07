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
import {
  Bell,
  Clock,
  CreditCard,
  MapPin,
  Monitor,
  Pause,
  Play,
  RefreshCw,
  Square,
  Stethoscope,
  UserX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Appointment } from '../../types'
import { getStatusIcon, getStatusStyles } from '../../utils/status-utils'

interface AppointmentModalProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SessionTimer {
  isRunning: boolean
  isPaused: boolean
  startTime: Date | null
  elapsedTime: number // em segundos
}

// Mock de dados do paciente expandidos
const getMockPatientData = (appointmentId: string) => ({
  id: appointmentId,
  name: 'Maria Silva',
  phone: '(11) 99999-9999',
  email: 'maria.silva@email.com',
  birthDate: '1985-03-15',
  age: 38,
  gender: 'Feminino',
  address: 'Rua das Flores, 123, São Paulo - SP, 01234-567',
  accountId: 'CONTA-2024-001',
  paymentStatus: 'pago',
  lastNotification: '2026-01-05T14:30:00Z',
})

const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'pago', label: 'Pago' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'nao-pago', label: 'Não Pago' },
  { value: 'no-show', label: 'No Show' },
  { value: 'remarcado', label: 'Remarcado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function AppointmentModal({
  appointment,
  open,
  onOpenChange,
}: AppointmentModalProps) {
  const [currentStatus, setCurrentStatus] = useState(
    appointment?.status || 'agendado'
  )
  const [timer, setTimer] = useState<SessionTimer>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
  })

  useEffect(() => {
    if (appointment) {
      setCurrentStatus(appointment.status)
    }
  }, [appointment])

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

  if (!appointment) return null

  const patientData = getMockPatientData(appointment.id)
  const styles = getStatusStyles(currentStatus)
  const StatusIcon = getStatusIcon(currentStatus)

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
      setCurrentStatus('no-show')
      // await updateStatus('no-show')
    } catch (error) {
      console.error('Erro ao marcar no-show:', error)
    }
  }

  const handleSendPaymentReminder = async () => {
    try {
      // await fetch(`/payments/${patientData.accountId}/reminder`, { method: 'POST' })
      console.log('Lembrete de pagamento enviado')
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error)
    }
  }

  const isPaymentPaid = patientData.paymentStatus === 'pago'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        {/* Título com ID */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold ">
            <span className="text-base font-normal dark:text-zinc-200/50">
              {' '}
              Agendamento{' '}
            </span>{' '}
            #{appointment.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header - Nome e Status */}
          <div className="flex items-center justify-between bg-muted/20 p-4  rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}
              >
                <StatusIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">Paciente</p>
                <h2 className="text-xl font-semibold">{patientData.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Status</p>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => setCurrentStatus(value as any)}
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
          </div>

          {/* Grid de 3 colunas - Modalidade, Data/Hora, Tipo */}
          <div className="grid grid-cols-3 gap-6">
            {/* Modalidade */}
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                {appointment.modalidade === 'presencial' ? (
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
                  {appointment.modalidade}
                </p>
              </div>
            </div>

            {/* Data e Horário */}
            <div className="flex items-center gap-3 p-3  rounded-lg">
              <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Data/Horário
                </p>
                <p className="font-semibold">
                  {new Date(appointment.date).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm">
                  {appointment.time} - {appointment.endTime}
                </p>
              </div>
            </div>

            {/* Tipo de Consulta */}
            <div className="flex items-center gap-3 p-3  rounded-lg">
              <div className="w-10 h-10 bg-zinc-300 rounded-lg flex items-center justify-center">
                {appointment.type === 'consulta' ? (
                  <Stethoscope className="h-5 w-5 text-zinc-600" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-zinc-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Tipo
                </p>
                <p className="font-semibold capitalize">{appointment.type}</p>
              </div>
            </div>
          </div>

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
                      Conta: {patientData.accountId}
                    </p>
                    <div className="flex items-center gap-2">
                      {patientData.lastNotification && (
                        <span className="text-xs text-muted-foreground">
                          Último lembrete:{' '}
                          {new Date(
                            patientData.lastNotification
                          ).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    className="px-4 py-1 "
                    variant={isPaymentPaid ? 'default' : 'destructive'}
                  >
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
            <h3 className="text-base font-semibold flex items-center gap-2">
              Informações do Paciente
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Telefone:
                  </span>
                  <span className="text-base">{patientData.phone}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Email:
                  </span>
                  <span className="text-base">{patientData.email}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium dark:text-zinc-500">
                    Idade:
                  </span>
                  <span className="text-base">
                    {patientData.age} anos,{' '}
                    {new Date(patientData.birthDate).toLocaleDateString(
                      'pt-BR',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Gênero:
                  </span>
                  <span className="text-base">{patientData.gender}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Endereço:
                  </span>
                  <span className="text-base">{patientData.address}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Footer - Controles de Sessão */}
          <div className="bg-muted/10 p-4 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold">
                    {formatTime(timer.elapsedTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tempo de sessão
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleStartSession}
                    variant={
                      timer.isRunning && !timer.isPaused
                        ? 'secondary'
                        : 'default'
                    }
                    className="flex items-center gap-2"
                  >
                    {timer.isRunning && !timer.isPaused ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {timer.isPaused ? 'Retomar' : 'Iniciar'} Sessão
                      </>
                    )}
                  </Button>

                  {timer.isRunning && (
                    <Button
                      onClick={handleStopSession}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Square className="h-3 w-3" />
                      Parar
                    </Button>
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNoShow}
                    className="flex w-full items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <UserX className="h-4 w-4" />
                    Paciente ausente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
