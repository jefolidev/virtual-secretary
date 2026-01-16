import z from 'zod'

export const editProfessionalWorkHoursBodySchema = z.object({
  newStartHour: z
    .string()
    .refine((val) => {
      if (!val) return true
      const [hours, minutes] = val.split(':').map(Number)
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    })
    .optional(),
  newEndHour: z
    .string()
    .refine((val) => {
      if (!val) return true
      const [hours, minutes] = val.split(':').map(Number)
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    })
    .optional(),
})

export type EditProfessionalWorkHoursBodySchema = z.infer<
  typeof editProfessionalWorkHoursBodySchema
>
