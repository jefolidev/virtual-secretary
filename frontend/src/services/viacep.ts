import axios from 'axios'

export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse> {
  const cleanCEP = cep.replace(/\D/g, '')
  const response = await axios.get<ViaCEPResponse>(
    `https://viacep.com.br/ws/${cleanCEP}/json/`
  )

  if (response.data.erro) {
    throw new Error('CEP não encontrado')
  }

  return response.data
}
