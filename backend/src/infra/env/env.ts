import z from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3333),
  NODE_ENV: z.string().default('development'),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  ASSISTANT_ID: z.string(),
  CORS_ORIGIN: z.string().optional().default('http://localhost:5173'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
})

export type Env = z.infer<typeof envSchema>
