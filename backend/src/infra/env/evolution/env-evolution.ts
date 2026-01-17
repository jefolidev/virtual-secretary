import z from 'zod'

export const envEvolutionSchema = z.object({
  AUTHENTICATION_API_KEY: z.string(),
  DATABASE_CONNECTION_URI: z.url(),
  CACHE_REDIS_ENABLED: z.string().transform((val) => val === 'true'),
  CACHE_REDIS_HOST: z.string(),
  CACHE_REDIS_PORT: z.coerce.number(),
})

export type EnvEvolution = z.infer<typeof envEvolutionSchema>
