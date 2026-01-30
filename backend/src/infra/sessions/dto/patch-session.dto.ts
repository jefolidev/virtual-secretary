import z from 'zod'

export const patchSessionSchema = z.object({
  currentFlow: z.string().optional(),
  currentStep: z.string().optional(),
  contextData: z.object().optional(),
  status: z.enum(['ACTIVE', 'FINISHED', 'EXPIRED']).optional(),

  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
  lastInteractionAt: z.coerce.date().optional(),
})

export type PatchSessionBody = z.infer<typeof patchSessionSchema>
