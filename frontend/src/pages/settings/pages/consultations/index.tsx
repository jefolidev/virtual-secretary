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
import { AlertCircle, Calendar, Clock, FileText } from 'lucide-react'
import { useState } from 'react'

export function ConsultationsSettingsPage() {
  // Initial values
  const initialValues = {
    // Schedule settings
    workDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    appointmentDuration: 45,
    breakTime: 15,
    startTime: '08:00',
    endTime: '18:00',

    // Cancellation settings
    sessionPrice: 150,
    minHoursBeforeCancellation: 24,
    cancelationFeePercentage: 50,
    minDaysBeforeNextAppointment: 1,
    allowReschedule: true,
    cancellationPolicy:
      'Cancelamentos realizados com menos de 24 horas de antecedência serão cobrados em 50% do valor da consulta.',
  }

  const [workDays, setWorkDays] = useState(initialValues.workDays)
  const [appointmentDuration, setAppointmentDuration] = useState(
    initialValues.appointmentDuration
  )
  const [breakTime, setBreakTime] = useState(initialValues.breakTime)
  const [startTime, setStartTime] = useState(initialValues.startTime)
  const [endTime, setEndTime] = useState(initialValues.endTime)
  const [sessionPrice, setSessionPrice] = useState(initialValues.sessionPrice)
  const [minHoursBeforeCancellation, setMinHoursBeforeCancellation] = useState(
    initialValues.minHoursBeforeCancellation
  )
  const [cancelationFeePercentage, setCancelationFeePercentage] = useState(
    initialValues.cancelationFeePercentage
  )
  const [minDaysBeforeNextAppointment, setMinDaysBeforeNextAppointment] =
    useState(initialValues.minDaysBeforeNextAppointment)
  const [allowReschedule, setAllowReschedule] = useState(
    initialValues.allowReschedule
  )
  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialValues.cancellationPolicy
  )
  const [timeError, setTimeError] = useState('')

  // Check if there are changes
  const hasChanges =
    JSON.stringify(workDays) !== JSON.stringify(initialValues.workDays) ||
    appointmentDuration !== initialValues.appointmentDuration ||
    breakTime !== initialValues.breakTime ||
    startTime !== initialValues.startTime ||
    endTime !== initialValues.endTime ||
    sessionPrice !== initialValues.sessionPrice ||
    minHoursBeforeCancellation !== initialValues.minHoursBeforeCancellation ||
    cancelationFeePercentage !== initialValues.cancelationFeePercentage ||
    minDaysBeforeNextAppointment !==
      initialValues.minDaysBeforeNextAppointment ||
    allowReschedule !== initialValues.allowReschedule ||
    cancellationPolicy !== initialValues.cancellationPolicy

  const toggleWorkDay = (day: keyof typeof workDays) => {
    setWorkDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }))
  }

  const validateTimes = (start: string, end: string) => {
    if (start && end) {
      const [startHour, startMin] = start.split(':').map(Number)
      const [endHour, endMin] = end.split(':').map(Number)

      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      if (endMinutes <= startMinutes) {
        setTimeError('O horário de término deve ser maior que o de início')
        return false
      }
    }
    setTimeError('')
    return true
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value
    setStartTime(newStartTime)
    validateTimes(newStartTime, endTime)
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value
    setEndTime(newEndTime)
    validateTimes(startTime, newEndTime)
  }

  const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === 0) return ''
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/[^0-9,]/g, '').replace(',', '.')
    return parseFloat(numericValue) || 0
  }

  const [displayPrice, setDisplayPrice] = useState(formatCurrency(sessionPrice))

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayPrice(inputValue)
    const numericValue = parseCurrency(inputValue)
    setSessionPrice(numericValue)
  }

  const handlePriceBlur = () => {
    if (sessionPrice > 0) {
      setDisplayPrice(formatCurrency(sessionPrice))
    }
  }

  const handleSave = () => {
    console.log('Salvando configurações de consultas:', {
      workDays,
      appointmentDuration,
      breakTime,
      startTime,
      endTime,
      sessionPrice,
      minHoursBeforeCancellation,
      cancelationFeePercentage,
      minDaysBeforeNextAppointment,
      allowReschedule,
      cancellationPolicy,
    })
  }

  return (
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
            <Input
              id="sessionPrice"
              type="text"
              placeholder="R$ 150,00"
              value={displayPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              className="max-w-xs"
            />
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
                  value={appointmentDuration}
                  onChange={(e) =>
                    setAppointmentDuration(Number(e.target.value))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breakTime">Tempo de intervalo (minutos)</Label>
                <Input
                  id="breakTime"
                  type="number"
                  placeholder="15"
                  min="0"
                  value={breakTime}
                  onChange={(e) => setBreakTime(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Horário de início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Horário de término</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  className={timeError ? 'border-red-500' : ''}
                />
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="monday"
                    checked={workDays.monday}
                    onCheckedChange={() => toggleWorkDay('monday')}
                  />
                  <Label htmlFor="monday" className="font-normal">
                    Segunda-feira
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tuesday"
                    checked={workDays.tuesday}
                    onCheckedChange={() => toggleWorkDay('tuesday')}
                  />
                  <Label htmlFor="tuesday" className="font-normal">
                    Terça-feira
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wednesday"
                    checked={workDays.wednesday}
                    onCheckedChange={() => toggleWorkDay('wednesday')}
                  />
                  <Label htmlFor="wednesday" className="font-normal">
                    Quarta-feira
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="thursday"
                    checked={workDays.thursday}
                    onCheckedChange={() => toggleWorkDay('thursday')}
                  />
                  <Label htmlFor="thursday" className="font-normal">
                    Quinta-feira
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="friday"
                    checked={workDays.friday}
                    onCheckedChange={() => toggleWorkDay('friday')}
                  />
                  <Label htmlFor="friday" className="font-normal">
                    Sexta-feira
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saturday"
                    checked={workDays.saturday}
                    onCheckedChange={() => toggleWorkDay('saturday')}
                  />
                  <Label htmlFor="saturday" className="font-normal">
                    Sábado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sunday"
                    checked={workDays.sunday}
                    onCheckedChange={() => toggleWorkDay('sunday')}
                  />
                  <Label htmlFor="sunday" className="font-normal">
                    Domingo
                  </Label>
                </div>
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
                    value={minHoursBeforeCancellation}
                    onChange={(e) =>
                      setMinHoursBeforeCancellation(Number(e.target.value))
                    }
                  />
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
                    value={cancelationFeePercentage}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value <= 100) {
                        setCancelationFeePercentage(value)
                      }
                    }}
                  />
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
                  value={minDaysBeforeNextAppointment}
                  onChange={(e) =>
                    setMinDaysBeforeNextAppointment(Number(e.target.value))
                  }
                />
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
                  checked={allowReschedule}
                  onCheckedChange={setAllowReschedule}
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
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={!hasChanges}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
