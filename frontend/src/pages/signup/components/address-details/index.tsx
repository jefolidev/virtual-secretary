import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAddressByCEP } from '@/services/viacep'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AddressDetailsProps {
  onValidationChange?: (isValid: boolean) => void
}

export function AddressDetails({ onValidationChange }: AddressDetailsProps) {
  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [number, setNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isFormValid = () => {
    const cleanCEP = cep.replace(/\D/g, '')
    return (
      cleanCEP.length === 8 &&
      street.trim() !== '' &&
      neighborhood.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== ''
    )
  }

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid())
    }
  }, [cep, street, neighborhood, city, state])

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
  }

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value)
    setCep(formattedCEP)

    const cleanCEP = formattedCEP.replace(/\D/g, '')

    if (cleanCEP.length === 8) {
      setLoading(true)
      setError('')
      clearAddressFields()

      try {
        const data = await fetchAddressByCEP(cleanCEP)

        // Pequeno delay para dar feedback visual
        await new Promise((resolve) => setTimeout(resolve, 300))

        setStreet(data.logradouro)
        setNeighborhood(data.bairro)
        setCity(data.localidade)
        setState(data.uf)
        if (data.complemento) {
          setComplement(data.complemento)
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
    setStreet('')
    setNeighborhood('')
    setCity('')
    setState('')
    setComplement('')
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
            value={cep}
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
              value={street}
              onChange={(e) => setStreet(e.target.value)}
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
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
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
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
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
            value={number}
            onChange={(e) => setNumber(e.target.value)}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
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
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
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
