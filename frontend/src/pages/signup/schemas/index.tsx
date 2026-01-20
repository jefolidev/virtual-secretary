import z from 'zod'

const RoleEnum = z.enum(['CLIENT', 'PROFESSIONAL'])
const PeriodPreferenceEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING'])

const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Endereço é obrigatório'),
  addressLine2: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  postalCode: z.string().min(8, 'CEP deve ter pelo menos 8 caracteres'),
  country: z.string().min(1, 'Insira o seu país de origem').default('Brasil'),
})

const clientDataSchema = z.object({
  periodPreference: z.array(PeriodPreferenceEnum).optional().default([]),
  extraPreference: z.string().optional(),
})

export const signUpFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.email('Formato de email inválido'),
  cpf: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos').max(14),
  whatsappNumber: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: RoleEnum,
  address: addressSchema,
  clientData: clientDataSchema.optional(),
})

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>
