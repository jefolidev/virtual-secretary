import z from 'zod'

export const editUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
})

export type EditUserBodySchema = z.infer<typeof editUserBodySchema>
