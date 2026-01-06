import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { ScreensEnum } from '@/types/screens'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { loginFormSchema, type LoginFormSchema } from './schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormSchema) {
    setError('')
    setIsLoading(true)

    try {
      await login({
        email: data.email,
        password: data.password,
      })
      navigate('/')
    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.')
      console.error('Erro no login:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-2">
          <h1 className="text-2xl font-bold mb-2">Bem vindo ao Mindly</h1>
          <span className="text-sm mb-4 text-zinc-500">
            Organize suas consultas e cuide da sua saúde mental. Deixe que nós
            cuidemos da sua mente.
          </span>
        </div>

        {/* Container fixo para o erro - mantém altura consistente */}
        <div className="min-h-8 mb-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className={`py-5 pl-10 pr-10 ${
                          fieldState.error
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : field.value &&
                              isValidEmail(field.value) &&
                              !fieldState.error
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : ''
                        }`}
                        placeholder="seu@email.com"
                        {...field}
                      />
                      {field.value &&
                        isValidEmail(field.value) &&
                        !fieldState.error && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      {fieldState.error && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className={`py-5 pl-10 pr-10 ${
                          fieldState.error
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : field.value && !fieldState.error
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : ''
                        }`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {field.value && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Sua senha deve conter:
                      </p>
                      <div className="space-y-1 text-xs">
                        <div
                          className={`flex items-center gap-2 ${
                            validatePassword(field.value).hasUpperCase
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {validatePassword(field.value).hasUpperCase ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 border border-gray-300 rounded-full" />
                          )}
                          Letra maiúscula
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            validatePassword(field.value).hasLowerCase
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {validatePassword(field.value).hasLowerCase ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 border border-gray-300 rounded-full" />
                          )}
                          Letra minúscula
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            validatePassword(field.value).hasNumber
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {validatePassword(field.value).hasNumber ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 border border-gray-300 rounded-full" />
                          )}
                          Número
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            validatePassword(field.value).hasMinLength
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {validatePassword(field.value).hasMinLength ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 border border-gray-300 rounded-full" />
                          )}
                          Mínimo 8 caracteres
                        </div>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm cursor-pointer hover:underline font-medium hover:text-zinc-500">
              Esqueceu a senha?
            </p>
            <div className="flex">
              <Button
                className="w-full rounded-2xl py-5"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Login'}
              </Button>
            </div>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm">
          Não tem uma conta?{' '}
          <span
            className="text-sm cursor-pointer hover:underline font-medium hover:text-zinc-500"
            onClick={() => navigate(`/${ScreensEnum.SIGNUP}`)}
          >
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  )
}
