import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ProfessionalCancellation() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="cancellationHours">
          Prazo mínimo para cancelamento (em horas)
        </Label>
        <Input
          id="cancellationHours"
          type="number"
          placeholder="24"
          min="0"
          onInput={(e) => {
            const target = e.target as HTMLInputElement
            target.value = target.value.replace(/[^0-9]/g, '')
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cancellationFee">
          Taxa de cancelamento (em % do valor da consulta)
        </Label>
        <Input
          id="cancellationFee"
          type="number"
          placeholder="0-100"
          min="0"
          max="100"
          onInput={(e) => {
            const target = e.target as HTMLInputElement
            target.value = target.value.replace(/[^0-9]/g, '')
          }}
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
        />
      </div>
    </div>
  )
}
