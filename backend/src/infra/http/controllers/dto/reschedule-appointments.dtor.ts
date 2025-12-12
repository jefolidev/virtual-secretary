import z from 'zod'

export const rescheduleAppointmentBodySchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
})

export type RescheduleAppointmentBodySchema = z.infer<
  typeof rescheduleAppointmentBodySchema
>
