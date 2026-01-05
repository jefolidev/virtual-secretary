import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAddressByCEP } from '@/services/viacep'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSignupForm } from '../../contexts/form-context'

interface AddressDetailsProps {
  onValidationChange?: (isValid: boolean) => void
}

export function AddressDetails({ onValidationChange }: AddressDetailsProps) {
  const { formData, updateNestedFormData } = useSignupForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isFormValid = () => {
    const cleanCEP = formData.address.cep.replace(/\D/g, '')
    return (
      cleanCEP.length === 8 &&
      formData.address.street.trim() !== '' &&
      formData.address.neighborhood.trim() !== '' &&
      formData.address.city.trim() !== '' &&
      formData.address.state.trim() !== ''
    )
  }

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid())
    }
  }, [
    formData.address.cep,
    formData.address.street,
    formData.address.neighborhood,
    formData.address.city,
    formData.address.state,
  ])

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
  }

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value)
    updateNestedFormData('address', 'cep', formattedCEP)

    const cleanCEP = formattedCEP.replace(/\D/g, '')

    if (cleanCEP.length === 8) {
      setLoading(true)
      setError('')
      clearAddressFields()

      try {
        const data = await fetchAddressByCEP(cleanCEP)

        // Pequeno delay para dar feedback visual
        await new Promise((resolve) => setTimeout(resolve, 300))

        updateNestedFormData('address', 'street', data.logradouro)
        updateNestedFormData('address', 'neighborhood', data.bairro)
        updateNestedFormData('address', 'city', data.localidade)
        updateNestedFormData('address', 'state', data.uf)
        if (data.complemento) {
          updateNestedFormData('address', 'complement', data.complemento)
        }
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar CEP')
      } finally {
        setLoading(false)
      }
    }
  }

  const clearAddressFields = () => {
    updateNestedFormData('address', 'street', '')
    updateNestedFormData('address', 'neighborhood', '')
    updateNestedFormData('address', 'city', '')
    updateNestedFormData('address', 'state', '')
    updateNestedFormData('address', 'complement', '')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="cep">
          CEP <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="cep"
            placeholder="00000-000"
            value={formData.address.cep}
            onChange={handleCEPChange}
            maxLength={9}
            required
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="street">
            Logradouro <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="street"
              placeholder="Nome do logradouro"
              value={formData.address.street}
              onChange={(e) =>
                updateNestedFormData('address', 'street', e.target.value)
              }
              disabled={loading}
              className={loading ? 'animate-pulse' : ''}
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            placeholder="Apto, bloco, etc"
            value={formData.address.complement}
            onChange={(e) =>
              updateNestedFormData('address', 'complement', e.target.value)
            }
            disabled={loading}
            className={loading ? 'animate-pulse' : ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="neighborhood">
            Bairro <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="neighborhood"
              placeholder="Bairro"
              value={formData.address.neighborhood}
              onChange={(e) =>
                updateNestedFormData('address', 'neighborhood', e.target.value)
              }
              disabled={loading}
              className={loading ? 'animate-pulse' : ''}
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            placeholder="123"
            value={formData.address.number}
            onChange={(e) =>
              updateNestedFormData('address', 'number', e.target.value)
            }
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="city">
            Cidade <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="city"
              placeholder="Cidade"
              value={formData.address.city}
              onChange={(e) =>
                updateNestedFormData('address', 'city', e.target.value)
              }
              disabled={loading}
              className={loading ? 'animate-pulse' : ''}
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">
            Estado <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="state"
              placeholder="UF"
              value={formData.address.state}
              onChange={(e) =>
                updateNestedFormData(
                  'address',
                  'state',
                  e.target.value.toUpperCase()
                )
              }
              maxLength={2}
              disabled={loading}
              className={loading ? 'animate-pulse' : ''}
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
