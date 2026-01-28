import type { FetchAddress } from '@/services/address/dto/fetch-address.dto'
import { formatPostalCode } from './format-cep'

export function formatFullAddress(addressProps: FetchAddress) {
  if (!addressProps) return 'Endereço não disponível'

  const { addressLine1, addressLine2, neighborhood, city, state, postalCode } =
    addressProps

  const mainAddress = [addressLine1, addressLine2].filter(Boolean).join(', ')
  const location = `${neighborhood ? neighborhood + ' - ' : ''}${city}/${state}`

  return `${mainAddress}, ${location} — CEP: ${formatPostalCode(postalCode)}`
}
