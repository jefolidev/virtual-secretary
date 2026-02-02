import z from 'zod'

export const createAppointmentBodySchema = z.object({
  professionalName: z.string().min(1),
  startDateTime: z.coerce.date(),
  modality: z.enum(['IN_PERSON', 'ONLINE']),
})

export type CreateAppointmentBodyDTO = z.infer<
  typeof createAppointmentBodySchema
>
