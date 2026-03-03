import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  Calendar,
  Clock,
  Info,
  RefreshCw,
  ScreenShare,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Switch } from '@/components/ui/switch'

import { appointmentsServices } from '@/api/endpoints/appointments'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useUser } from '@/hooks/use-user'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { toast } from 'sonner'

interface RescheduleModalProps {
  clientId: string
}

const rescheduleSchema = z.object({
  date: z.string().min(1, 'A data é obrigatória'),
  startTime: z.string().min(1, 'O horário de início é obrigatório'),
  modality: z.enum(['IN_PERSON', 'ONLINE'], {
    message: 'A modalidade é obrigatória',
  }),
  syncWithGoogleCalendar: z.boolean(),
})
type RescheduleFormData = z.infer<typeof rescheduleSchema>

dayjs.locale('pt-br')

function formatDateTime(date: string, time: string) {
  return dayjs(`${date}T${time}`).format('dddd, DD [de] MMMM, [às] HH:mm')
}

export function RescheduleModal({ clientId }: RescheduleModalProps) {
  const [hasOverlap, setHasOverlap] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { user, syncWithGoogle } = useAuth()
  const { professionalSettings, fetchProfessionalSettings } = useUser()

  const handleConnectGoogle = async () => {
    await syncWithGoogle()
    await fetchProfessionalSettings()
  }

  const { settings } = professionalSettings ? professionalSettings : {}

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      syncWithGoogleCalendar: false,
      modality: 'IN_PERSON',
    },
  })

  const watchedDate = watch('date')
  const watchedStart = watch('startTime')
  const watchedModality = watch('modality')
  const watchedSync = watch('syncWithGoogleCalendar')

  const onSubmit = async (data: RescheduleFormData) => {
    setHasOverlap(false)

    try {
      const startDateTime = dayjs(`${data.date}T${data.startTime}`).toDate()

      await appointmentsServices.createAppointment({
        clientId,
        professionalId: user?.professional_id || '',
        modality: data.modality,
        startDateTime,
        syncWithGoogleCalendar: data.syncWithGoogleCalendar,
      })

      toast.success(
        `Retorno agendado com sucesso para ${formatDateTime(data.date, data.startTime)}!`,
      )

      reset()
      setIsOpen(false)
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status

      toast.error(
        `Erro ao agendar retorno: ${status === 409 ? 'Horário indisponível!' : 'Erro desconhecido.'}`,
      )
      if (status === 409) {
        setHasOverlap(true)
        return
      }
      console.error('Erro ao reagendar consulta:', error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      reset()
      setHasOverlap(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <RefreshCw className="mr-1" />
          Agendar retorno
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar consulta</DialogTitle>
          <DialogDescription asChild>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="py-2">
              {/* ── Date + Start time ─────────────────────────────────── */}
              <div className="flex items-start gap-2.5 mb-4">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex gap-1.5 items-center mb-1.5">
                    <Calendar className="w-4 text-slate-900" />
                    <Label htmlFor="reschedule-date" className="text-slate-900">
                      Selecione a data do retorno:
                    </Label>
                  </div>
                  <Input
                    id="reschedule-date"
                    type="date"
                    {...register('date')}
                  />
                  {errors.date && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1 w-1/3">
                  <div className="flex gap-1.5 items-center mb-1.5">
                    <Clock className="w-4 text-slate-900" />
                    <Label
                      htmlFor="reschedule-start"
                      className="text-slate-900 text-sm"
                    >
                      Horário de início:
                    </Label>
                  </div>
                  <Input
                    id="reschedule-start"
                    type="time"
                    {...register('startTime')}
                  />
                  {errors.startTime && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full mb-4">
                <div className="flex gap-1.5 items-center mb-1.5">
                  <ScreenShare className="w-4 text-slate-900" />
                  <Label
                    htmlFor="reschedule-modality"
                    className="text-slate-900"
                  >
                    Modalidade
                  </Label>
                </div>
                <Select
                  value={watchedModality}
                  onValueChange={(value) => {
                    reset({
                      ...watch(),
                      modality: value as 'IN_PERSON' | 'ONLINE',
                    })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {['IN_PERSON', 'ONLINE'].map((modality) => (
                      <SelectItem key={modality} value={modality}>
                        {modality === 'IN_PERSON' ? 'Presencial' : 'Online'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={watchedSync}
                  onCheckedChange={(checked) => {
                    reset({ ...watch(), syncWithGoogleCalendar: checked })
                  }}
                />
                <Label htmlFor="sync-with-google-calendar">
                  Criar consulta no Google Calendar
                </Label>
              </div>

              {/* ── Summary card ──────────────────────────────────────── */}
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4" />
                <span className="text-sm text-slate-500">
                  Detalhes do retorno
                </span>
              </div>
              <div className="bg-foreground/10 w-full py-6 px-4 rounded-md mb-4">
                <div className="grid grid-cols-2">
                  <span className="text-sm text-slate-400 font-medium">
                    Paciente:{' '}
                    <p className="text-slate-700 inline">João da Silva</p>
                  </span>

                  <span className=" text-slate-700">
                    <p className="inline font-medium text-slate-400">
                      Modalidade:{' '}
                    </p>
                    {watchedModality === 'IN_PERSON'
                      ? 'Presencial'
                      : watchedModality === 'ONLINE'
                        ? 'Online'
                        : '—'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-1">
                  <span className="text-sm text-slate-400 font-medium">
                    Início:{' '}
                    <span className="font-medium text-slate-700">
                      {watchedDate &&
                        watchedStart &&
                        formatDateTime(watchedDate, watchedStart)}
                    </span>
                  </span>
                  <span className="text-sm text-slate-400 font-medium">
                    Fim:{' '}
                    <span className="font-medium text-slate-700">
                      {watchedDate &&
                        watchedStart &&
                        formatDateTime(
                          watchedDate,
                          dayjs(`${watchedDate}T${watchedStart}`)
                            .add(
                              settings?.preferences.props
                                .sessionDurationMinutes || 0,
                              'minute',
                            )
                            .format('HH:mm'),
                        )}
                    </span>
                  </span>
                </div>
              </div>

              {/* ── Overlap warning ───────────────────────────────────── */}
              {watchedSync &&
                professionalSettings?.professional.googleConnectionStatus !==
                  'CONNECTED' && (
                  <div className="flex items-start gap-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-3 mb-4">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800">
                      Você está desconectado do Google Calendar. Você conseguirá
                      criar o agendamento mas não será salvo no seu calendário
                      do Google.{' '}
                      <a
                        onClick={handleConnectGoogle}
                        className="underline font-medium text-blue-700 hover:text-blue-900"
                      >
                        Clique aqui para se conectar
                      </a>
                      .
                    </p>
                  </div>
                )}

              {hasOverlap && (
                <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Já existe uma consulta agendada neste horário. Por favor,
                    escolha outro horário disponível.
                  </p>
                </div>
              )}

              {/* ── Actions ───────────────────────────────────────────── */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Verificando...' : 'Confirmar retorno'}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
