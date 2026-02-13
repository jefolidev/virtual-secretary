export function formatCPF(cpf: string): string {
  // Remove any non-digit characters
  const cleanedCPF = cpf.replace(/\D/g, '')

  // Check if the cleaned CPF has exactly 11 digits
  if (cleanedCPF.length !== 11) {
    return cpf // Return the original CPF if it's not valid
  }

  // Format the CPF as XXX.XXX.XXX-XX
  const formattedCPF = `${cleanedCPF.slice(0, 3)}.${cleanedCPF.slice(
    3,
    6,
  )}.${cleanedCPF.slice(6, 9)}-${cleanedCPF.slice(9, 11)}`

  return formattedCPF
}