import z from 'zod'

export const editCancellationPolicyBodySchema = z.object({
  minHoursBeforeCancellation: z
    .number()
    .min(6, 'The minimun of hours to cancel the schedule is 6.')
    .optional(),
  minDaysBeforeNextAppointment: z
    .number()
    .min(1, 'The minimun of days before next schedule must be greater than 1.')
    .optional(),
  cancelationFeePercentage: z.number().min(0).max(100).optional(),
  allowReschedule: z.boolean().optional(),
  description: z.string().optional(),
})

export type EditCancellationPolicyBodySchema = z.infer<
  typeof editCancellationPolicyBodySchema
>
