import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CloudSun, Moon, Sun } from 'lucide-react'

interface PatientPreferencesProps {
  preferredTimes: Array<'morning' | 'afternoon' | 'evening'>
  onToggleTime: (time: 'morning' | 'afternoon' | 'evening') => void
}

export function PatientPreferences({
  preferredTimes,
  onToggleTime,
}: PatientPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Períodos de preferência para consultas</Label>
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
        <div className="grid gap-2">
          <Label htmlFor="specialty">Especialidade preferencial</Label>
          <Select>
            <SelectTrigger id="specialty">
              <SelectValue placeholder="Selecione uma especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardiology">Cardiologia</SelectItem>
              <SelectItem value="dermatology">Dermatologia</SelectItem>
              <SelectItem value="endocrinology">Endocrinologia</SelectItem>
              <SelectItem value="gynecology">Ginecologia</SelectItem>
              <SelectItem value="neurology">Neurologia</SelectItem>
              <SelectItem value="orthopedics">Ortopedia</SelectItem>
              <SelectItem value="pediatrics">Pediatria</SelectItem>
              <SelectItem value="psychiatry">Psiquiatria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Tipo de atendimento</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="inPerson" />
              <Label htmlFor="inPerson" className="font-normal">
                Presencial
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="online" />
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
