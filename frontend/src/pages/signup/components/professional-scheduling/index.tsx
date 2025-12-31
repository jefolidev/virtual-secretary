import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
}

export function ProfessionalScheduling({
  workDays,
  onToggleWorkDay,
}: ProfessionalSchedulingProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="appointmentDuration">
            Duração da consulta (minutos)
          </Label>
          <Input
            id="appointmentDuration"
            type="number"
            placeholder="30"
            min="0"
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              target.value = target.value.replace(/[^0-9]/g, '')
            }}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="breakTime">Intervalo entre consultas (minutos)</Label>
          <Input
            id="breakTime"
            type="number"
            placeholder="10"
            min="0"
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
          <Input id="startTime" type="time" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endTime">Horário de término</Label>
          <Input id="endTime" type="time" />
        </div>
      </div>

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
