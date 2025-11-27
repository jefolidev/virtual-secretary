import { checkPasswordStrong } from '@/utils/checkPasswordStrong'
import { cpf as cpfParser } from 'cpf-cnpj-validator'
import z from 'zod'

export const createAccountBodySchema = z.object({
  name: z.string().min(2, 'Name must have more than 2 characters.'),
  email: z.email('Invalid email'),
  password: z.string().refine(checkPasswordStrong, {
    message:
      'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número',
  }),
  cpf: z.string().refine((value) => cpfParser.isValid(value), 'Invalid CPF'),
  phone: z
    .string()
    .min(9, 'Phone must have at least 9 characters')
    .max(9, 'Phone must have just 9 characters'),
  role: z.enum(['CLIENT', 'PROFESSIONAL']),
  address: z.object({
    addressLine1: z.string().min(1, 'Address must be provided'),
    addressLine2: z.string().optional(),
    neighborhood: z.string().min(1, 'Neighborhood must be provided'),
    city: z.string().min(1, 'City must be provided'),
    state: z.string().min(1, 'State must be provided'),
    postalCode: z.string().min(8, 'Postal code must be provided'),
    country: z.string().min(1, 'Country must be provided').default('Brasil'),
  }),
})

export type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>
