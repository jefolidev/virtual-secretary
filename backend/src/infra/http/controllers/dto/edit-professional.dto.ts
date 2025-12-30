import z from 'zod'

export const editProfessionalBodySchema = z.object({
  sessionPrice: z.number().optional(),
  channels: z.array(z.enum(['WHATSAPP', 'EMAIL'])).optional(),
  enabledTypes: z
    .array(
      z.enum([
        'NEW_APPOINTMENT',
        'CANCELLATION',
        'CONFIRMATION',
        'DAILY_SUMMARY',
        'CONFIRMED_LIST',
        'PAYMENT_STATUS',
      ])
    )
    .optional(),
  reminderBeforeMinutes: z.number().optional(),
  dailySummaryTime: z.string().optional(),
})

export type EditProfessionalBodySchema = z.infer<
  typeof editProfessionalBodySchema
>
