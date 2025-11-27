export function checkPasswordStrong(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must have at least 8 characters.')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must have at least one uppercase word.')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must have at least one lowcase word.')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must have at least one number.')
  }

  if (!/^[A-Za-z0-9]+$/.test(password)) {
    errors.push('Password must have only numbers and words.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
