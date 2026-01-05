import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ValidationError } from '@/utils/validation'
import { AlertTriangle } from 'lucide-react'

interface ValidationErrorDisplayProps {
  errors: ValidationError[]
}

export function ValidationErrorDisplay({
  errors,
}: ValidationErrorDisplayProps) {
  if (errors.length === 0) return null

  // Agrupa erros por etapa
  const errorsByStep = errors.reduce(
    (acc: Record<number, ValidationError[]>, error) => {
      const step = error.step ?? 0
      if (!acc[step]) acc[step] = []
      acc[step].push(error)
      return acc
    },
    {}
  )

  const stepNames = [
    'Tipo de Usuário',
    'Detalhes da Conta',
    'Preferências/Configurações',
    'Horários de Trabalho',
    'Notificações',
    'Endereço',
  ]

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-semibold">
            Corrija os seguintes erros antes de continuar:
          </p>
          {Object.entries(errorsByStep).map(([step, stepErrors]) => (
            <div key={step} className="ml-2">
              <p className="font-medium text-sm mb-1">
                📍 {stepNames[parseInt(step)] || `Etapa ${parseInt(step) + 1}`}:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {stepErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
