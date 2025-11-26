import z from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3333),
  NODE_ENV: z.string().default('development'),
})

export type Env = z.infer<typeof envSchema>
