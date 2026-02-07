import z from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().optional().default(3333),
  NODE_ENV: z.string().default('development'),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  ASSISTANT_ID: z.string(),
  CORS_ORIGIN: z.string().optional().default('http://localhost:5173'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  AUTHENTICATION_API_KEY: z.string(),
  EVOLUTION_API_URL: z.string().optional().default('http://localhost:8080'),
  EVOLUTION_INSTANCE_ID: z.string().optional().default('MindAI'),
  GOOGLE_CALENDAR_CLIENT_ID: z.string(),
  GOOGLE_CALENDAR_SECRET: z.string(),
  API_URI: z.string().optional().default('http://localhost:'),
  FRONTEND_URL: z.string().optional().default('http://localhost:5173'),
  GOOGLE_REDIRECT_URI: z
    .string()
    .optional()
    .default('http://localhost:3333/webhooks/google/oauth/callback'),
})

export type Env = z.infer<typeof envSchema>
