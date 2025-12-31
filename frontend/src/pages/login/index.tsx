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
import { ScreensEnum } from '@/types/screens'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { loginFormSchema, type LoginFormSchema } from './schemas'

export function LoginPage() {
  const navigate = useNavigate()

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: LoginFormSchema) {
    console.log(data)
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
            <Button className="w-full rounded-2xl py-5" type="submit">
              Login
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
