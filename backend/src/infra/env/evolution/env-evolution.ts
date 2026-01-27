import z from 'zod'

//TODO: REMOVER ESSE ARQUIVO DPS
export const envEvolutionSchema = z.object({
  AUTHENTICATION_API_KEY: z.string(),
})

export type EnvEvolution = z.infer<typeof envEvolutionSchema>
