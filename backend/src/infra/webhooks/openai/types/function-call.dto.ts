import z from 'zod'

export const functionCallSchema = z.object({
  functionCallName: z.string(),
  args: z.any(),
  whatsappNumber: z.string(),
})

export type FunctionCall = z.infer<typeof functionCallSchema>
