import { SkeletonPage } from '@/components/skeleton'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/hooks/use-user'
import type {
  DayOfWeek,
  UpdateCancellationPolicyData,
  UpdateScheduleConfigurationData,
} from '@/types/user'
import { useCurrencyMask } from '@/utils/format-currency'
import { AlertCircle, Calendar, Clock, FileText } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { mappedWorkDays } from './utils/days-of-week'

interface ConsultationFormData {
  cancellationPolicy: UpdateCancellationPolicyData
  preferences: UpdateScheduleConfigurationData
  sessionPrice: number
}

export function ConsultationsSettingsPage() {
  const {
    professionalSettings,
    loading,
    updateScheduleConfiguration,
    updateCancellationPolicy,
    fetchProfessionalSettings,
  } = useUser()

  useEffect(() => {
    fetchProfessionalSettings()
  }, [])

  const { professional, settings } = professionalSettings || {}
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ConsultationFormData>({
    mode: 'onChange',
    defaultValues: {
      sessionPrice: 0,
      cancellationPolicy: {},
      preferences: {
        sessionDurationMinutes: 0,
        bufferIntervalMinutes: 0,
        enableGoogleMeet: false,
        workingHours: {
          start: '',
          end: '',
        },
        workingDays: {
          currentItems: [],
          new: [],
        },
      },
    },
  })

  // Update form when professionalSettings loads
  useEffect(() => {
    if (professionalSettings) {
      const {
        settings: { cancellationPolicy, preferences },
      } = professionalSettings

      reset(
        {
          sessionPrice: professional?.sessionPrice,
          cancellationPolicy: cancellationPolicy?.props,
          preferences: {
            sessionDurationMinutes: preferences?.props?.sessionDurationMinutes,
            bufferIntervalMinutes: preferences?.props?.bufferIntervalMinutes,
            enableGoogleMeet: preferences?.props?.enableGoogleMeet,
            workingHours: {
              start: preferences?.props?.workingHours?.start || '',
              end: preferences?.props?.workingHours?.end || '',
            },
            workingDays: {
              currentItems: preferences?.props?.workingDays?.currentItems,
              new: preferences?.props?.workingDays?.currentItems || [],
            },
          },
        },
        { keepDirtyValues: false }
      )
    }
  }, [professionalSettings, reset, professional])

  const workDays = watch('preferences.workingDays.currentItems')
  const workingHours = watch('preferences.workingHours')

  const timeError =
    errors.preferences?.workingHours?.end?.message ||
    errors.preferences?.workingHours?.start?.message

  if (!professionalSettings) {
    return <SkeletonPage />
  }

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      // Convert DayOfWeek enums to numbers for API

      // Get selected days
      const selectedDays = data.preferences.workingDays?.new || []

      // Try sending schedule configuration without working days first
      const scheduleConfigurationForAPI: any = {
        sessionDurationMinutes: data.preferences.sessionDurationMinutes,
        bufferIntervalMinutes: data.preferences.bufferIntervalMinutes,
        enableGoogleMeet: data.preferences.enableGoogleMeet,
        workingHours: data.preferences.workingHours,
        // Don't send working days yet
      }

      console.log('[ScheduleConfigurationForAPI without workingDays]', scheduleConfigurationForAPI)
      console.log('[Selected Days that need separate update]', selectedDays)
      console.log('[Form Data]', data.preferences.workingDays)

      // Update schedule configuration (without working days)
      const result = await updateScheduleConfiguration(scheduleConfigurationForAPI)
      console.log('[Update Result]', result)
      
      // TODO: Add separate call for working days when backend provides endpoint
      console.log('Working days update needs separate endpoint:', selectedDays)

      // Update cancellation policy
      await updateCancellationPolicy(data.cancellationPolicy)

      // Refetch the professional settings to get updated data
      await fetchProfessionalSettings()

      toast.success('Configurações de consultas atualizadas com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      toast.error('Erro ao salvar configurações. Tente novamente.')
    }
  }

  return loading ? (
    <SkeletonPage />
  ) : (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Configurações de Consultas
        </CardTitle>
        <CardDescription>
          Configure horários de atendimento, preços e políticas de cancelamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Session Price - Top Field */}
          <div className="grid gap-2">
            <Label htmlFor="sessionPrice" className="text-base font-medium">
              Valor da sessão (em R$)
            </Label>
            <Controller
              name="sessionPrice"
              control={control}
              rules={{
                required: 'Valor da sessão é obrigatório',
                min: { value: 0.01, message: 'Valor deve ser maior que zero' },
              }}
              render={({ field: { onChange, value } }) => {
                const { handleCurrencyChange, formatForDisplay } =
                  useCurrencyMask()

                return (
                  <Input
                    id="sessionPrice"
                    placeholder="R$ 0,00"
                    value={formatForDisplay(value || 0)}
                    onChange={(e) =>
                      handleCurrencyChange(e.target.value, onChange)
                    }
                    className="max-w-xs"
                  />
                )
              }}
            />
            {errors.sessionPrice && (
              <span className="text-sm text-red-600">
                {errors.sessionPrice.message}
              </span>
            )}
          </div>

          <Separator />

          {/* Schedule Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                Configuração de Horários
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="appointmentDuration">
                  Duração da consulta (minutos)
                </Label>
                <Input
                  id="appointmentDuration"
                  type="number"
                  placeholder="30"
                  min="1"
                  {...register('preferences.sessionDurationMinutes', {
                    required: 'Duração é obrigatória',
                    min: {
                      value: 1,
                      message: 'Duração deve ser maior que zero',
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.preferences?.sessionDurationMinutes && (
                  <span className="text-sm text-red-600">
                    {errors.preferences.sessionDurationMinutes.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breakTime">Tempo de intervalo (minutos)</Label>
                <Input
                  id="breakTime"
                  type="number"
                  placeholder="15"
                  min="10"
                  {...register('preferences.bufferIntervalMinutes', {
                    required: 'Intervalo é obrigatório',
                    min: {
                      value: 10,
                      message: 'Intervalo deve ser maior ou igual a dez',
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.preferences?.bufferIntervalMinutes && (
                  <span className="text-sm text-red-600">
                    {errors.preferences.bufferIntervalMinutes.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Horário de início</Label>
                <Controller
                  name="preferences.workingHours.start"
                  control={control}
                  rules={{ required: 'Horário de início é obrigatório' }}
                  render={({ field }) => (
                    <Input
                      id="startTime"
                      type="time"
                      {...field}
                      value={field.value || ''}
                    />
                  )}
                />
                {errors.preferences?.workingHours?.start && (
                  <span className="text-sm text-red-600">
                    {errors.preferences.workingHours.start.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Horário de término</Label>
                <Controller
                  name="preferences.workingHours.end"
                  control={control}
                  rules={{ required: 'Horário de término é obrigatório' }}
                  render={({ field }) => (
                    <Input
                      id="endTime"
                      type="time"
                      {...field}
                      value={field.value || ''}
                      className={timeError ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.preferences?.workingHours?.end && (
                  <span className="text-sm text-red-600">
                    {errors.preferences.workingHours.end.message}
                  </span>
                )}
              </div>
            </div>
            {timeError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{timeError}</span>
              </div>
            )}

            <div className="space-y-3">
              <Label>Dias de atendimento</Label>
              <div className="grid grid-cols-2 gap-3">
                {mappedWorkDays.map((day) => {
                  if (!professionalSettings.settings.preferences.props)
                    return <SkeletonPage />

                  return (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id.toString()}
                        checked={(
                          watch('preferences.workingDays.new') || []
                        ).includes(day.id as DayOfWeek)}
                        onCheckedChange={(checked) => {
                          const currentNewDays =
                            watch('preferences.workingDays.new') || []
                          const newDays = checked
                            ? [...currentNewDays, day.id as DayOfWeek]
                            : currentNewDays.filter((d) => d !== day.id)

                          setValue('preferences.workingDays.new', newDays, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }}
                      />
                      <Label className="font-normal">{day.label}</Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Cancellation Policy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                Política de Cancelamento
              </h3>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cancellationHours">
                    Prazo mínimo para cancelamento (horas)
                  </Label>
                  <Input
                    id="cancellationHours"
                    type="number"
                    placeholder="24"
                    min="0"
                    {...register(
                      'cancellationPolicy.minHoursBeforeCancellation',
                      {
                        required: 'Prazo mínimo é obrigatório',
                        min: {
                          value: 0,
                          message: 'Prazo deve ser maior ou igual a zero',
                        },
                        valueAsNumber: true,
                      }
                    )}
                  />
                  {errors.cancellationPolicy?.minHoursBeforeCancellation && (
                    <span className="text-sm text-red-600">
                      {
                        errors.cancellationPolicy.minHoursBeforeCancellation
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cancellationFee">
                    Taxa de cancelamento (%)
                  </Label>
                  <Input
                    id="cancellationFee"
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    {...register(
                      'cancellationPolicy.cancelationFeePercentage',
                      {
                        required: 'Taxa de cancelamento é obrigatória',
                        min: {
                          value: 0,
                          message: 'Taxa deve ser maior ou igual a zero',
                        },
                        max: {
                          value: 100,
                          message: 'Taxa deve ser menor ou igual a 100',
                        },
                        valueAsNumber: true,
                      }
                    )}
                  />
                  {errors.cancellationPolicy?.cancelationFeePercentage && (
                    <span className="text-sm text-red-600">
                      {
                        errors.cancellationPolicy.cancelationFeePercentage
                          .message
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="minDaysBeforeNextAppointment">
                  Mínimo de dias para próximo agendamento
                </Label>
                <Input
                  id="minDaysBeforeNextAppointment"
                  type="number"
                  placeholder="1"
                  min="1"
                  {...register(
                    'cancellationPolicy.minDaysBeforeNextAppointment',
                    {
                      required: 'Mínimo de dias é obrigatório',
                      min: { value: 1, message: 'Deve ser pelo menos 1 dia' },
                      valueAsNumber: true,
                    }
                  )}
                />
                {errors.cancellationPolicy?.minDaysBeforeNextAppointment && (
                  <span className="text-sm text-red-600">
                    {
                      errors.cancellationPolicy.minDaysBeforeNextAppointment
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="allowReschedule">
                    Permitir reagendamento
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que pacientes reagendem consultas ao invés de apenas
                    cancelar
                  </p>
                </div>
                <Switch
                  id="allowReschedule"
                  {...register('cancellationPolicy.allowReschedule')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cancellationPolicy">
                  Política de cancelamento (opcional)
                </Label>
                <Textarea
                  id="cancellationPolicy"
                  placeholder="Descreva sua política de cancelamento..."
                  rows={4}
                  {...register('cancellationPolicy.description')}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || loading || !!timeError}
              className="min-w-37.5"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
