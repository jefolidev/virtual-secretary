import z from 'zod'

export const fetchAvailableProfessionalSlotsQuerySchema = z.object({
  professionalId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export type FetchAvailableProfessionalSlotsQuerySchema = z.infer<
  typeof fetchAvailableProfessionalSlotsQuerySchema
>
