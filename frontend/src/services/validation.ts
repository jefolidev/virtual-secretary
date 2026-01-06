import { api } from '@/api/axios'

export async function checkDataAvailability(data: {
  email: string
  cpf: string
  phone: string
}): Promise<{ available: boolean; conflicts: string[] }> {
  try {
    console.log('🔍 Verificando disponibilidade dos dados...')
    const response = await api.post('/check-availability', data)

    return {
      available: response.data.available,
      conflicts: response.data.conflicts || [],
    }
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade:', error)

    if (error?.response?.status === 404) {
      console.warn('Endpoint de verificação não encontrado, prosseguindo...')
      return { available: true, conflicts: [] }
    }

    return { available: false, conflicts: ['Erro ao verificar dados'] }
  }
}

export function getConflictMessage(conflicts: string[]): string {
  const conflictMap: Record<string, string> = {
    email: 'E-mail já está em uso',
    cpf: 'CPF já está cadastrado',
    phone: 'Telefone já está em uso',
  }

  const messages = conflicts
    .map((conflict) => conflictMap[conflict] || `${conflict} já está em uso`)
    .join(', ')

  return `Os seguintes dados já estão cadastrados: ${messages}`
}
