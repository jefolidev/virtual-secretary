import z from 'zod'

export const rescheduleAppointmentBodySchema = z.object({
  startDate: z.coerce.date(),
})

export type RescheduleAppointmentBodySchema = z.infer<
  typeof rescheduleAppointmentBodySchema
>
