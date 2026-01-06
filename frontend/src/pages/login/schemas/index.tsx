import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Formato de email inválido' }),
  password: z
    .string()
    .min(1, { message: 'Senha é obrigatória' })
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>
