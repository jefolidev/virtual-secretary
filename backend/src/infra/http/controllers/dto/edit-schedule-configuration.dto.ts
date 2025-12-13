import z from 'zod'

export const editScheduleConfigurationBodySchema = z.object({
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  daysOfWeek: z
    .array(z.number().min(0).max(6))
    .min(1, 'At least one day must be selected')
    .optional(),
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
