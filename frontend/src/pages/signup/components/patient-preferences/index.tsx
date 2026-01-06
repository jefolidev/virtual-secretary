import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CloudSun, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { useSignupForm } from '../../contexts/form-context'

interface PatientPreferencesProps {
  onValidationChange?: (isValid: boolean) => void
}

export function PatientPreferences({
  onValidationChange,
}: PatientPreferencesProps) {
  const { formData, updateFormData } = useSignupForm()

  const handleToggleTime = (time: 'morning' | 'afternoon' | 'evening') => {
    const currentTimes = formData.periodPreference
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter((t) => t !== time)
      : [...currentTimes, time]

    updateFormData('periodPreference', newTimes)
  }

  useEffect(() => {
    if (onValidationChange) {
      const hasPreferredTime = formData.periodPreference.length > 0
      onValidationChange(hasPreferredTime)
    }
  }, [formData.periodPreference, onValidationChange])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>
          Períodos de preferência para consultas{' '}
          <span className="text-red-500">*</span>
        </Label>
        {formData.periodPreference.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>Selecione pelo menos um período de preferência</span>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => handleToggleTime('morning')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              formData.periodPreference.includes('morning')
                ? 'border-zinc-800 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <Sun
              className={`h-8 w-8 ${
                formData.periodPreference.includes('morning')
                  ? 'text-zinc-800'
                  : 'text-zinc-400'
              }`}
            />
            <span className="text-sm font-medium">Manhã</span>
            <span className="text-xs text-muted-foreground">06:00 - 12:00</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleTime('afternoon')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              formData.periodPreference.includes('afternoon')
                ? 'border-zinc-800 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <CloudSun
              className={`h-8 w-8 ${
                formData.periodPreference.includes('afternoon')
                  ? 'text-zinc-800'
                  : 'text-zinc-400'
              }`}
            />
            <span className="text-sm font-medium">Tarde</span>
            <span className="text-xs text-muted-foreground">12:00 - 18:00</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleTime('evening')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              formData.periodPreference.includes('evening')
                ? 'border-zinc-800 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <Moon
              className={`h-8 w-8 ${
                formData.periodPreference.includes('evening')
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
          <Label htmlFor="extraPreferences">Preferências Extras</Label>
          <Textarea
            id="extraPreferences"
            placeholder="Descreva aqui suas preferências adicionais, horários específicos, necessidades especiais, etc."
            value={formData.extraPreferences}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateFormData('extraPreferences', e.target.value)
            }
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Campo opcional para informações adicionais que possam ajudar na
            organização das suas consultas.
          </p>
        </div>
      </div>
    </div>
  )
}
