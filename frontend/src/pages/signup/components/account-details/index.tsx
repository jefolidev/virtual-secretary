import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSignupForm } from '../../contexts/form-context'

interface AccountDetailsProps {
  onValidationChange?: (isValid: boolean) => void
}

export function AccountDetails({ onValidationChange }: AccountDetailsProps) {
  const { formData, updateFormData } = useSignupForm()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (pwd: string) => {
    return {
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasMinLength: pwd.length >= 8,
    }
  }

  const passwordValidation = validatePassword(formData.password)
  const allPasswordRequirementsMet =
    passwordValidation.hasUpperCase &&
    passwordValidation.hasLowerCase &&
    passwordValidation.hasNumber &&
    passwordValidation.hasMinLength

  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== ''

  const isFormValid = () => {
    const cleanPhone = formData.phone.replace(/\D/g, '')
    const cleanCPF = formData.cpf.replace(/\D/g, '')

    return (
      formData.name.trim() !== '' &&
      isValidEmail(formData.email) &&
      allPasswordRequirementsMet &&
      passwordsMatch &&
      cleanPhone.length >= 10 &&
      cleanCPF.length === 11 &&
      formData.birthdate !== ''
    )
  }

  // Notifica o componente pai sobre mudanças na validação
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid())
    }
  }, [
    formData.name,
    formData.email,
    formData.password,
    formData.confirmPassword,
    formData.phone,
    formData.cpf,
    formData.birthdate,
  ])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('phone', formatPhone(e.target.value))
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('cpf', formatCPF(e.target.value))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">
          Nome completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          required
        />
        {formData.email && !isValidEmail(formData.email) && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Email inválido</span>
          </div>
        )}
        {formData.email && isValidEmail(formData.email) && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Email válido</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="password">
              Senha <span className="text-red-500">*</span>
            </Label>
            <div className="group relative  ">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute left-0 top-6 z-10 w-64 rounded-md bg-gray-900 p-3 text-xs text-white shadow-lg">
                <div className="space-y-1">
                  <div
                    className={
                      formData.password && passwordValidation.hasUpperCase
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {formData.password && passwordValidation.hasUpperCase
                      ? '✓'
                      : '○'}{' '}
                    Letra maiúscula
                  </div>
                  <div
                    className={
                      formData.password && passwordValidation.hasLowerCase
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {formData.password && passwordValidation.hasLowerCase
                      ? '✓'
                      : '○'}{' '}
                    Letra minúscula
                  </div>
                  <div
                    className={
                      formData.password && passwordValidation.hasNumber
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {formData.password && passwordValidation.hasNumber
                      ? '✓'
                      : '○'}{' '}
                    Número
                  </div>
                  <div
                    className={
                      formData.password && passwordValidation.hasMinLength
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {formData.password && passwordValidation.hasMinLength
                      ? '✓'
                      : '○'}{' '}
                    Mínimo 8 caracteres
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">
            Confirmar senha <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData('confirmPassword', e.target.value)
              }
              className={
                formData.confirmPassword && !passwordsMatch
                  ? 'border-red-500 focus-visible:ring-red-500 pr-20'
                  : formData.confirmPassword && passwordsMatch
                  ? 'border-green-500 focus-visible:ring-green-500 pr-20'
                  : 'pr-20'
              }
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {formData.confirmPassword && (
                <div>
                  {passwordsMatch ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {formData.confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600">As senhas não coincidem</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">
          Telefone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          placeholder="(00) 00000-0000"
          value={formData.phone}
          onChange={handlePhoneChange}
          maxLength={15}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cpf">
          CPF <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cpf"
          placeholder="000.000.000-00"
          value={formData.cpf}
          onChange={handleCPFChange}
          maxLength={14}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthdate">
          Data de nascimento <span className="text-red-500">*</span>
        </Label>
        <Input
          id="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={(e) => updateFormData('birthdate', e.target.value)}
          required
        />
      </div>
    </div>
  )
}
