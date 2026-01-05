import z from 'zod'

export const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Logradouro é obrigatório'),
  addressLine2: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  postalCode: z.string().min(8, 'O CEP deve ter pelo menos 8 caracteres'),
})

export type AddressSchema = z.infer<typeof addressSchema>
