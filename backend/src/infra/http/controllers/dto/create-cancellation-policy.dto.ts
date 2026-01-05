import z from 'zod'

export const createCancellationPolicyBodySchema = z.object({
  professionalId: z.string().uuid('Professional ID must be a valid UUID'),
  minHoursBeforeCancellation: z
    .number()
    .min(6, 'The minimun of hours to cancel the schedule is 6.'),
  minDaysBeforeNextAppointment: z
    .number()
    .min(1, 'The minimun of days before next schedule must be greater than 1.'),
  cancelationFeePercentage: z.number().min(0).max(100),
  allowReschedule: z.boolean(),
  description: z.string().optional(),
})

export type CreateCancellationPolicyBodySchema = z.infer<
  typeof createCancellationPolicyBodySchema
>
