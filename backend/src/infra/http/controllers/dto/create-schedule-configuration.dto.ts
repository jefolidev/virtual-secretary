import z from 'zod'

export const createScheduleConfigurationBodySchema = z.object({
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  daysOfWeek: z
    .array(z.number().min(0).max(6))
    .min(1, 'At least one day must be selected'),
  sessionDurationMinutes: z
    .number()
    .min(10, 'Session duration must be at least 10 minutes'),
  bufferIntervalMinutes: z
    .number()
    .min(10, 'Buffer interval must be at least 10 minutes'),
  holidays: z.array(z.date()),
  enableGoogleMeet: z.boolean().default(false),
})

export type CreateScheduleConfigurationBodySchema = z.infer<
  typeof createScheduleConfigurationBodySchema
>
