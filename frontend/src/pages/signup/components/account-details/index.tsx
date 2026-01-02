import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react'
import { useState } from 'react'

export function AccountDetails() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
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
      hasMinLength: pwd.length >= 6,
    }
  }

  const passwordValidation = validatePassword(password)

  const passwordsMatch = password === confirmPassword && confirmPassword !== ''

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
    setPhone(formatPhone(e.target.value))
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" placeholder="Seu nome completo" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email && !isValidEmail(email) && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Email inválido</span>
          </div>
        )}
        {email && isValidEmail(email) && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Email válido</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="group relative  ">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute left-0 top-6 z-10 w-64 rounded-md bg-gray-900 p-3 text-xs text-white shadow-lg">
                <div className="space-y-1">
                  <div
                    className={
                      password && passwordValidation.hasUpperCase
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {password && passwordValidation.hasUpperCase ? '✓' : '○'}{' '}
                    Letra maiúscula
                  </div>
                  <div
                    className={
                      password && passwordValidation.hasLowerCase
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {password && passwordValidation.hasLowerCase ? '✓' : '○'}{' '}
                    Letra minúscula
                  </div>
                  <div
                    className={
                      password && passwordValidation.hasNumber
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {password && passwordValidation.hasNumber ? '✓' : '○'}{' '}
                    Número
                  </div>
                  <div
                    className={
                      password && passwordValidation.hasMinLength
                        ? 'text-green-400'
                        : ''
                    }
                  >
                    {password && passwordValidation.hasMinLength ? '✓' : '○'}{' '}
                    Mínimo 6 caracteres
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
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
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={
                confirmPassword && !passwordsMatch
                  ? 'border-red-500 focus-visible:ring-red-500 pr-20'
                  : confirmPassword && passwordsMatch
                  ? 'border-green-500 focus-visible:ring-green-500 pr-20'
                  : 'pr-20'
              }
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {confirmPassword && (
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
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600">As senhas não coincidem</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={15}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={handleCPFChange}
          maxLength={14}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthdate">Data de nascimento</Label>
        <Input id="birthdate" type="date" />
      </div>
    </div>
  )
}
