import z from 'zod'

export const editUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  whatsappNumber: z.string().optional(),
})

export type EditUserBodySchema = z.infer<typeof editUserBodySchema>
