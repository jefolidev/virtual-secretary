import z from 'zod'

export const editProfessionalWorkDaysBodySchema = z.object({
  newDays: z.array(z.number().min(0).max(6)),
})

export type EditProfessionalWorkDaysBodySchema = z.infer<
  typeof editProfessionalWorkDaysBodySchema
>
