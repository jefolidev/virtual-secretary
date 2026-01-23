import z from 'zod'

export const processMessageBodySchema = z.object({
  whatsappId: z.uuid(),
  text: z.string(),
  pushName: z.string(),
})

export type ProcessMessageBody = z.infer<typeof processMessageBodySchema>
