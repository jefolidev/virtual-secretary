import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z.email({ message: 'Credenciais inválidas' }),
  password: z.string().min(6, { message: 'Credenciais inválidas' }),
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>
