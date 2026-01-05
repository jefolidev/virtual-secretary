import type { SignupData } from '@/contexts/auth-context'

export interface ValidationError {
  field: string
  message: string
  step?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Validação de CPF
function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validação do dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

// Validação de email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone brasileiro
function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  // Aceita formato (11) 99999-9999 ou (11) 9999-9999
  return cleanPhone.length === 11 || cleanPhone.length === 10
}

// Validação de senha
function validatePassword(password: string): {
  isValid: boolean
  message?: string
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'A senha deve ter pelo menos 8 caracteres',
    }
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra minúscula',
    }
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra maiúscula',
    }
  }
  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um número',
    }
  }
  return { isValid: true }
}

// Validação de CEP
function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '')
  return cleanCEP.length === 8
}

// Validação completa de todos os dados do formulário
export function validateSignupData(data: SignupData): ValidationResult {
  const errors: ValidationError[] = []

  // Etapa 1: Tipo de usuário
  if (!data.userType) {
    errors.push({
      field: 'userType',
      message: 'Selecione o tipo de usuário',
      step: 0,
    })
  }

  // Etapa 2: Detalhes da conta
  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Nome deve ter pelo menos 2 caracteres',
      step: 1,
    })
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'E-mail inválido',
      step: 1,
    })
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push({
      field: 'password',
      message: passwordValidation.message || 'Senha inválida',
      step: 1,
    })
  }

  if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Confirmação de senha não confere',
      step: 1,
    })
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Telefone inválido',
      step: 1,
    })
  }

  if (!data.cpf || !validateCPF(data.cpf)) {
    errors.push({
      field: 'cpf',
      message: 'CPF inválido',
      step: 1,
    })
  }

  if (!data.birthdate) {
    errors.push({
      field: 'birthdate',
      message: 'Data de nascimento é obrigatória',
      step: 1,
    })
  } else {
    // Verifica se a pessoa tem pelo menos 16 anos
    const birthDate = new Date(data.birthdate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    if (age < 16) {
      errors.push({
        field: 'birthdate',
        message: 'Você deve ter pelo menos 16 anos',
        step: 1,
      })
    }
  }

  // Etapa 3a: Preferências do paciente (se aplicável)
  if (data.userType === 'patient') {
    if (!data.periodPreference || data.periodPreference.length === 0) {
      errors.push({
        field: 'periodPreference',
        message: 'Selecione pelo menos uma preferência de período',
        step: 2,
      })
    }
  }

  // Etapa 3b-5: Configurações profissionais (se aplicável)
  if (data.userType === 'professional') {
    // Validação de política de cancelamento (opcional)

    // Validação de horários de trabalho
    if (!data.workDays || Object.values(data.workDays).every((day) => !day)) {
      errors.push({
        field: 'workDays',
        message: 'Selecione pelo menos um dia de trabalho',
        step: 3,
      })
    }

    if (
      !data.appointmentDuration ||
      data.appointmentDuration < 15 ||
      data.appointmentDuration > 180
    ) {
      errors.push({
        field: 'appointmentDuration',
        message: 'Duração da consulta deve ser entre 15 e 180 minutos',
        step: 3,
      })
    }

    if (
      data.breakTime !== undefined &&
      (data.breakTime < 0 || data.breakTime > 60)
    ) {
      errors.push({
        field: 'breakTime',
        message: 'Intervalo deve ser entre 0 e 60 minutos',
        step: 3,
      })
    }

    // Validação de horários
    if (!data.startTime) {
      errors.push({
        field: 'startTime',
        message: 'Horário de início é obrigatório',
        step: 3,
      })
    }

    if (!data.endTime) {
      errors.push({
        field: 'endTime',
        message: 'Horário de fim é obrigatório',
        step: 3,
      })
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.push({
        field: 'endTime',
        message: 'Horário de fim deve ser posterior ao horário de início',
        step: 3,
      })
    }

    // Validação de notificações (pelo menos uma deve estar ativa)
    if (
      data.notifications &&
      Object.values(data.notifications).every((notification) => !notification)
    ) {
      errors.push({
        field: 'notifications',
        message: 'Ative pelo menos um tipo de notificação',
        step: 4,
      })
    }

    // Validação de canais de notificação (pelo menos um deve estar ativo)
    if (
      data.notificationChannels &&
      Object.values(data.notificationChannels).every((channel) => !channel)
    ) {
      errors.push({
        field: 'notificationChannels',
        message: 'Selecione pelo menos um canal de notificação',
        step: 4,
      })
    }
  }

  // Etapa final: Endereço
  if (!data.address) {
    errors.push({
      field: 'address',
      message: 'Dados de endereço são obrigatórios',
      step: data.userType === 'patient' ? 3 : 5,
    })
  } else {
    const stepNumber = data.userType === 'patient' ? 3 : 5

    if (!data.address.cep || !validateCEP(data.address.cep)) {
      errors.push({
        field: 'address.cep',
        message: 'CEP inválido',
        step: stepNumber,
      })
    }

    if (!data.address.street || data.address.street.trim().length < 5) {
      errors.push({
        field: 'address.street',
        message: 'Endereço deve ter pelo menos 5 caracteres',
        step: stepNumber,
      })
    }

    if (
      !data.address.neighborhood ||
      data.address.neighborhood.trim().length < 2
    ) {
      errors.push({
        field: 'address.neighborhood',
        message: 'Bairro deve ter pelo menos 2 caracteres',
        step: stepNumber,
      })
    }

    if (!data.address.city || data.address.city.trim().length < 2) {
      errors.push({
        field: 'address.city',
        message: 'Cidade deve ter pelo menos 2 caracteres',
        step: stepNumber,
      })
    }

    if (!data.address.state || data.address.state.trim().length !== 2) {
      errors.push({
        field: 'address.state',
        message: 'Estado deve ter exatamente 2 caracteres',
        step: stepNumber,
      })
    }

    if (data.address.number && data.address.number.trim().length === 0) {
      errors.push({
        field: 'address.number',
        message: 'Número não pode estar vazio se informado',
        step: stepNumber,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
