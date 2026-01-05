import z from 'zod'

export const cancellationPolicySchema = z.object({
  allowReschedule: z.boolean().default(true),
  cancelationFeePercentage: z
    .number()
    .min(0, 'A porcentagem deve ser maior ou igual a 0')
    .max(100, 'A porcentagem deve ser menor ou igual a 100')
    .default(0),
  minDaysBeforeNextAppointment: z
    .number()
    .min(0, 'O número de dias deve ser maior ou igual a 0')
    .default(0),
  minHoursBeforeCancellation: z
    .number()
    .min(0, 'O número de horas deve ser maior ou igual a 0')
    .default(0),
  description: z.string().optional(),
})

export type CancellationPolicy = z.infer<typeof cancellationPolicySchema>
