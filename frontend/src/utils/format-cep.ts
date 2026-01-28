/**
 * Formata uma string ou número para o padrão de CEP brasileiro (00000-000).
 */
export function formatPostalCode(
  value: string | number | undefined | null,
): string {
  if (!value) return ''

  const cleaned = value.toString().replace(/\D/g, '')

  if (cleaned.length !== 8) {
    return cleaned
  }
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
}
