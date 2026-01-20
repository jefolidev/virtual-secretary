import z from 'zod'

export const envEvolutionSchema = z.object({
  AUTHENTICATION_API_KEY: z.string(),
})

export type EnvEvolution = z.infer<typeof envEvolutionSchema>
