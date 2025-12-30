import z from 'zod'

export const editClientBodySchema = z.object({
  extraPreferences: z.string().optional(),
  periodPreference: z
    .array(z.enum(['MORNING', 'AFTERNOON', 'EVENING']))
    .optional(),
})

export type EditClientBodySchema = z.infer<typeof editClientBodySchema>
