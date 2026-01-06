import z from 'zod'

export const loginBodySchema = z.object({
  email: z
    .email({ message: 'Formato de email inválido' })
    .min(1, { message: 'Email é obrigatório' }),
  password: z
    .string()
    .min(1, { message: 'Senha é obrigatória' })
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
})

export type LoginBodySchema = z.infer<typeof loginBodySchema>
