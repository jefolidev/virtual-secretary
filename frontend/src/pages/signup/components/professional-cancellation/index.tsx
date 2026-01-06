import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import { useSignupForm } from '../../contexts/form-context'

export function ProfessionalCancellation() {
  const { formData, updateFormData } = useSignupForm()
  const [displayPrice, setDisplayPrice] = useState('')

  // Função para formatar valor para moeda brasileira
  const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === 0) return ''
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Função para extrair número da string formatada
  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/[^0-9,]/g, '').replace(',', '.')
    return parseFloat(numericValue) || 0
  }

  // Sincronizar displayPrice com formData.sessionPrice
  useEffect(() => {
    const price = formData.sessionPrice || 0
    if (price > 0) {
      setDisplayPrice(formatCurrency(price))
    } else {
      setDisplayPrice('')
    }
  }, [formData.sessionPrice])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayPrice(inputValue)

    // Atualizar o valor numérico no formData
    const numericValue = parseCurrency(inputValue)
    updateFormData('sessionPrice', numericValue)
  }

  const handlePriceBlur = () => {
    // Reformatar o valor quando o campo perde o foco
    const price = formData.sessionPrice || 0
    if (price > 0) {
      setDisplayPrice(formatCurrency(price))
    }
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="sessionPrice">
          Valor da sessão (em R$) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sessionPrice"
          type="text"
          placeholder="R$ 150,00"
          value={displayPrice}
          onChange={handlePriceChange}
          onBlur={handlePriceBlur}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cancellationHours">
          Prazo mínimo para cancelamento (em horas)
        </Label>
        <Input
          id="cancellationHours"
          type="number"
          placeholder="24"
          min="0"
          value={formData.minHoursBeforeCancellation || ''}
          onChange={(e) =>
            updateFormData('minHoursBeforeCancellation', Number(e.target.value))
          }
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
          value={formData.cancelationFeePercentage || ''}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (value <= 100) {
              updateFormData('cancelationFeePercentage', value)
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLInputElement
            const value = target.value.replace(/[^0-9]/g, '')
            if (Number(value) <= 100) {
              target.value = value
            } else {
              target.value = '100'
            }
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="minDaysBeforeNextAppointment">
          Mínimo de dias para próximo agendamento{' '}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="minDaysBeforeNextAppointment"
          type="number"
          placeholder="1"
          min="1"
          value={formData.minDaysBeforeNextAppointment || ''}
          onChange={(e) =>
            updateFormData(
              'minDaysBeforeNextAppointment',
              Number(e.target.value)
            )
          }
          onInput={(e) => {
            const target = e.target as HTMLInputElement
            target.value = target.value.replace(/[^0-9]/g, '')
          }}
        />
      </div>

      <div className="grid gap-3 py-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="allowReschedule">Permitir reagendamento</Label>
            <p className="text-sm text-gray-600">
              Permite que pacientes reagendem consultas ao invés de apenas
              cancelar
            </p>
          </div>
          <Switch
            id="allowReschedule"
            checked={formData.allowReschedule}
            onCheckedChange={(checked) =>
              updateFormData('allowReschedule', checked)
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cancellationPolicy">
          Política de cancelamento (opcional)
        </Label>
        <Textarea
          id="cancellationPolicy"
          placeholder="Descreva sua política de cancelamento..."
          rows={4}
          value={formData.cancellationPolicy || ''}
          onChange={(e) => updateFormData('cancellationPolicy', e.target.value)}
        />
      </div>
    </div>
  )
}
