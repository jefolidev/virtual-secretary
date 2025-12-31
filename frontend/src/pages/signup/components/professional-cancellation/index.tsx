import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

      <div className="grid gap-2">
        <Label htmlFor="specialty">Especialidade</Label>
        <Select>
          <SelectTrigger id="specialty">
            <SelectValue placeholder="Selecione sua especialidade" />
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

      <div className="grid gap-2">
        <Label htmlFor="crm">Número do CRM</Label>
        <Input id="crm" placeholder="CRM/UF 000000" />
      </div>
    </div>
  )
}
