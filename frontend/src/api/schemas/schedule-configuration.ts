import z from 'zod'

const dayOfWeekSchema = z.enum(['0', '1', '2', '3', '4', '5', '6'])

export const scheduleConfigurationSchema = z.object({
  bufferIntervalMinutes: z.number().min(0).max(1440),
  enableGoogleMeet: z.boolean().default(false),
  daysOfWeek: z.array(dayOfWeekSchema).min(1).max(7),
  workingHours: z.object({
    start: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format, expected HH:MM'),
    end: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format, expected HH:MM'),
  }),
  holidays: z
    .array(
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          'Invalid date format, expected YYYY-MM-DD'
        )
    )
    .optional(),
  sessionDurationMinutes: z.number().min(15).max(480),
})

export type ScheduleConfiguration = z.infer<typeof scheduleConfigurationSchema>
