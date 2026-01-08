import z from 'zod'

export const editUserAccountSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  email: z.email('Email inválido').optional(),
  cpf: z
    .string()
    .min(11, 'O CPF deve ter pelo menos 11 caracteres')
    .max(14, 'O CPF deve ter no máximo 14 caracteres')
    .optional(),
})

export type EditUserAccountSchema = z.infer<typeof editUserAccountSchema>
