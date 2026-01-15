export const formatCurrency = (value: number): string => {
  if (isNaN(value) || value === 0) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export const formatCurrencyInput = (value: number): string => {
  if (!value || value === 0) return ''
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const parseCurrencyInput = (inputValue: string): number => {
  // Remove tudo exceto dígitos
  const digitsOnly = inputValue.replace(/\D/g, '')

  if (digitsOnly === '') {
    return 0
  }

  // Converte centavos para reais (últimos 2 dígitos são centavos)
  const cents = parseInt(digitsOnly) || 0
  return cents / 100
}

export const useCurrencyMask = () => {
  const handleCurrencyChange = (
    inputValue: string,
    onChange: (value: number) => void
  ) => {
    const numericValue = parseCurrencyInput(inputValue)
    onChange(numericValue)
  }

  const formatForDisplay = (value: number): string => {
    return formatCurrencyInput(value)
  }

  return {
    handleCurrencyChange,
    formatForDisplay,
  }
}
