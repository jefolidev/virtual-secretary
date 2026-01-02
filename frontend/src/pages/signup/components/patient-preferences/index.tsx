import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, CloudSun, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

interface PatientPreferencesProps {
  preferredTimes: Array<'morning' | 'afternoon' | 'evening'>
  onToggleTime: (time: 'morning' | 'afternoon' | 'evening') => void
  appointmentTypes: {
    inPerson: boolean
    online: boolean
  }
  onToggleAppointmentType: (type: 'inPerson' | 'online') => void
  onValidationChange?: (isValid: boolean) => void
}

export function PatientPreferences({
  preferredTimes,
  onToggleTime,
  appointmentTypes,
  onToggleAppointmentType,
  onValidationChange,
}: PatientPreferencesProps) {
  useEffect(() => {
    if (onValidationChange) {
      const hasPreferredTime = preferredTimes.length > 0
      const hasAppointmentType =
        appointmentTypes.inPerson || appointmentTypes.online
      onValidationChange(hasPreferredTime && hasAppointmentType)
    }
  }, [preferredTimes, appointmentTypes, onValidationChange])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>
          Períodos de preferência para consultas{' '}
          <span className="text-red-500">*</span>
        </Label>
        {preferredTimes.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>Selecione pelo menos um período de preferência</span>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => onToggleTime('morning')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              preferredTimes.includes('morning')
                ? 'border-zinc-800 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <Sun
              className={`h-8 w-8 ${
                preferredTimes.includes('morning')
                  ? 'text-zinc-800'
                  : 'text-zinc-400'
              }`}
            />
            <span className="text-sm font-medium">Manhã</span>
            <span className="text-xs text-muted-foreground">06:00 - 12:00</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleTime('afternoon')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              preferredTimes.includes('afternoon')
                ? 'border-zinc-800 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <CloudSun
              className={`h-8 w-8 ${
                preferredTimes.includes('afternoon')
                  ? 'text-zinc-800'
                  : 'text-zinc-400'
              }`}
            />
            <span className="text-sm font-medium">Tarde</span>
            <span className="text-xs text-muted-foreground">12:00 - 18:00</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleTime('evening')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              preferredTimes.includes('evening')
                ? 'border-zinc-800 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <Moon
              className={`h-8 w-8 ${
                preferredTimes.includes('evening')
                  ? 'text-zinc-800'
                  : 'text-zinc-400'
              }`}
            />
            <span className="text-sm font-medium">Noite</span>
            <span className="text-xs text-muted-foreground">18:00 - 22:00</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>
            Tipo de atendimento <span className="text-red-500">*</span>
          </Label>
          {!appointmentTypes.inPerson && !appointmentTypes.online && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>Selecione pelo menos um tipo de atendimento</span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inPerson"
                checked={appointmentTypes.inPerson}
                onCheckedChange={() => onToggleAppointmentType('inPerson')}
              />
              <Label htmlFor="inPerson" className="font-normal">
                Presencial
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="online"
                checked={appointmentTypes.online}
                onCheckedChange={() => onToggleAppointmentType('online')}
              />
              <Label htmlFor="online" className="font-normal">
                Online (Telemedicina)
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
