import z from 'zod'

export const createClientBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  cpf: z.string(),
  birthDate: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE']),
  whatsappNumber: z.string(),
  cep: z.string(),
  number: z.string(),
  complement: z.string(),
  periodPreference: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING'])),
  extraPreferences: z.string(),
})

export type CreateClientBodyDTO = z.infer<typeof createClientBodySchema>
