import z from 'zod'

export const fetchAvailableProfessionalSlotsBodySchema = z.object({
  professionalId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export type FetchAvailableProfessionalSlotsBodySchema = z.infer<
  typeof fetchAvailableProfessionalSlotsBodySchema
>
