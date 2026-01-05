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
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { loginFormSchema, type LoginFormSchema } from './schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      // Redireciona para a página inicial após login bem-sucedido
      navigate('/')
    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.')
      console.error('Erro no login:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-140 py-64">
      <div className="flex flex-col items-center text-center mb-5">
        <h1 className="text-2xl font-bold mb-2">Bem vindo ao Mindly</h1>
        <span className="text-sm mb-4 text-zinc-500">
          Organize suas consultas e cuide da sua saúde mental. Deixe que nós
          cuidemos da sua mente.
        </span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className="py-5" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    className="py-5"
                    type="password"
                    placeholder="Senha"
                    {...field}
                  />
                </FormControl>
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
  )
}
