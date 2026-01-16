import z from 'zod'

export const editScheduleConfigurationBodySchema = z.object({
  sessionDurationMinutes: z
    .number()
    .min(10, 'Session duration must be at least 10 minutes')
    .optional(),
  bufferIntervalMinutes: z
    .number()
    .min(10, 'Buffer interval must be at least 10 minutes')
    .optional(),
  holidays: z.array(z.date()).optional(),
  enableGoogleMeet: z.boolean().default(false).optional(),
})

export type EditScheduleConfigurationBodySchema = z.infer<
  typeof editScheduleConfigurationBodySchema
>
