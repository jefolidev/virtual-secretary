import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProfessionalSchedulingProps {
  workDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  onToggleWorkDay: (
    day:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday'
  ) => void
  appointmentDuration: number
  breakTime: number
  startTime: string
  endTime: string
  onFieldChange: (field: string, value: string | number) => void
  onValidationChange?: (isValid: boolean) => void
}

export function ProfessionalScheduling({
  workDays,
  onToggleWorkDay,
  appointmentDuration,
  breakTime,
  startTime,
  endTime,
  onFieldChange,
  onValidationChange,
}: ProfessionalSchedulingProps) {
  const [timeError, setTimeError] = useState('')

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

  useEffect(() => {
    if (onValidationChange) {
      const hasWorkDay = Object.values(workDays).some((day) => day)
      const hasAppointmentDuration = appointmentDuration > 0
      const hasBreakTime = breakTime >= 0
      const hasStartTime = startTime !== ''
      const hasEndTime = endTime !== ''
      const timesValid = !timeError

      onValidationChange(
        hasWorkDay &&
          hasAppointmentDuration &&
          hasBreakTime &&
          hasStartTime &&
          hasEndTime &&
          timesValid
      )
    }
  }, [
    workDays,
    appointmentDuration,
    breakTime,
    startTime,
    endTime,
    timeError,
    onValidationChange,
  ])

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value
    onFieldChange('startTime', newStartTime)
    validateTimes(newStartTime, endTime)
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value
    onFieldChange('endTime', newEndTime)
    validateTimes(startTime, newEndTime)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="appointmentDuration">
            Duração da consulta (minutos){' '}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="appointmentDuration"
            type="number"
            placeholder="30"
            min="1"
            value={appointmentDuration}
            onChange={(e) =>
              onFieldChange('appointmentDuration', Number(e.target.value))
            }
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              target.value = target.value.replace(/[^0-9]/g, '')
            }}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="breakTime">
            Tempo de intervalo (minutos) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="breakTime"
            type="number"
            placeholder="15"
            min="0"
            value={breakTime}
            onChange={(e) => onFieldChange('breakTime', Number(e.target.value))}
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              target.value = target.value.replace(/[^0-9]/g, '')
            }}
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
              onCheckedChange={() => onToggleWorkDay('monday')}
            />
            <Label htmlFor="monday" className="font-normal">
              Segunda-feira
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tuesday"
              checked={workDays.tuesday}
              onCheckedChange={() => onToggleWorkDay('tuesday')}
            />
            <Label htmlFor="tuesday" className="font-normal">
              Terça-feira
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wednesday"
              checked={workDays.wednesday}
              onCheckedChange={() => onToggleWorkDay('wednesday')}
            />
            <Label htmlFor="wednesday" className="font-normal">
              Quarta-feira
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="thursday"
              checked={workDays.thursday}
              onCheckedChange={() => onToggleWorkDay('thursday')}
            />
            <Label htmlFor="thursday" className="font-normal">
              Quinta-feira
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="friday"
              checked={workDays.friday}
              onCheckedChange={() => onToggleWorkDay('friday')}
            />
            <Label htmlFor="friday" className="font-normal">
              Sexta-feira
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saturday"
              checked={workDays.saturday}
              onCheckedChange={() => onToggleWorkDay('saturday')}
            />
            <Label htmlFor="saturday" className="font-normal">
              Sábado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sunday"
              checked={workDays.sunday}
              onCheckedChange={() => onToggleWorkDay('sunday')}
            />
            <Label htmlFor="sunday" className="font-normal">
              Domingo
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
