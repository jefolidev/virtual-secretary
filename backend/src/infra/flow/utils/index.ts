interface RegistrationData {
  name: string
  email: string
  whatsappNumber: string
  cpf: string
  gender: 'MALE' | 'FEMALE'
  birthDate: Date
  extraPreferences?: string
  periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
  complement?: string | null
  cep: string
  number: string
}

export function extractRegistrationData(message: string): RegistrationData {
  const data: Partial<RegistrationData> = {}

  const nameMatch = message.match(/nome é ([A-Za-z\s]+)/i)
  if (nameMatch) data.name = nameMatch[1].trim()

  const emailMatch = message.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  )
  if (emailMatch) data.email = emailMatch[0]

  const cpfMatch = message.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/)
  if (cpfMatch) data.cpf = cpfMatch[0].replace(/\D/g, '')

  if (/masculino/i.test(message)) data.gender = 'MALE'
  if (/feminino/i.test(message)) data.gender = 'FEMALE'

  const birthMatch = message.match(/\b(\d{2}\/\d{2}\/\d{4})\b/)
  if (birthMatch)
    data.birthDate = new Date(birthMatch[1].split('/').reverse().join('-'))

  const cepMatch = message.match(/\b\d{5}-?\d{3}\b/)
  if (cepMatch) data.cep = cepMatch[0].replace(/\D/g, '')

  const numberMatch = message.match(/número (\d+)/i)
  if (numberMatch) data.number = numberMatch[1]

  const complementMatch = message.match(/complemento (\w+)/i)
  if (complementMatch) data.complement = complementMatch[1]

  data.periodPreference = []
  if (/manhã/i.test(message)) data.periodPreference.push('MORNING')
  if (/tarde/i.test(message)) data.periodPreference.push('AFTERNOON')
  if (/noite/i.test(message)) data.periodPreference.push('EVENING')

  if (!data) {
    throw new Error('Incomplete registration data')
  }

  return data as RegistrationData
}
