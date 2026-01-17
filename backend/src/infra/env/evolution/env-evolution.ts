import z from 'zod'

export const envEvolutionSchema = z.object({
  AUTHENTICATION_API_KEY: z.string(),
  DATABASE_CONNECTION_URI: z.url(),
  CACHE_REDIS_ENABLED: z.string().transform((val) => val === 'true'),
  CACHE_REDIS_URI: z.string(),
})

export type EnvEvolution = z.infer<typeof envEvolutionSchema>
