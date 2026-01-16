import z from 'zod'

// Session Price Schema
export const updateSessionPriceSchema = z.object({
  sessionPrice: z
    .number()
    .min(0, 'O preço da sessão deve ser maior ou igual a 0')
    .optional(),
})

// Schedule Configuration Schema
export const updateScheduleSettingsSchema = z.object({
  sessionDurationMinutes: z
    .number()
    .min(15, 'A duração da sessão deve ser pelo menos 15 minutos')
    .max(480, 'A duração da sessão não pode exceder 8 horas')
    .optional(),
  bufferIntervalMinutes: z
    .number()
    .min(10, 'O intervalo deve ser pelo menos 10 minutos')
    .max(1440, 'O intervalo não pode exceder 24 horas')
    .optional(),
  enableGoogleMeet: z.boolean().default(false).optional(),
  workingHours: z
    .object({
      start: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Formato de horário inválido (HH:MM)'
        )
        .optional(),
      end: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Formato de horário inválido (HH:MM)'
        )
        .optional(),
    })
    .optional(),
  daysOfWeek: z
    .array(z.number().min(0).max(6))
    .min(1, 'Pelo menos um dia deve ser selecionado')
    .optional(),
  holidays: z
    .array(
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          'Formato de data inválido, esperado AAAA-MM-DD'
        )
    )
    .optional(),
})

// Cancellation Policy Schema
export const updateCancellationPolicySchema = z.object({
  allowReschedule: z.boolean().default(true).optional(),
  cancelationFeePercentage: z
    .number()
    .min(0, 'A porcentagem deve ser maior ou igual a 0')
    .max(100, 'A porcentagem deve ser menor ou igual a 100')
    .optional(),
  minDaysBeforeNextAppointment: z
    .number()
    .min(0, 'O número de dias deve ser maior ou igual a 0')
    .optional(),
  minHoursBeforeCancellation: z
    .number()
    .min(0, 'O número de horas deve ser maior ou igual a 0')
    .optional(),
  description: z.string().optional(),
})

export const consultationSettingsSchema = z.object({
  sessionPrice: z
    .number()
    .min(0.01, 'O preço da sessão deve ser maior que 0')
    .optional(),
  preferences: updateScheduleSettingsSchema.optional(),
  cancellationPolicy: updateCancellationPolicySchema.optional(),
})

// Legacy schema for backward compatibility
export const editScheduleConfigurationBodySchema = updateScheduleSettingsSchema

// Type exports
export type UpdateSessionPrice = z.infer<typeof updateSessionPriceSchema>
export type UpdateScheduleSettings = z.infer<
  typeof updateScheduleSettingsSchema
>
export type UpdateCancellationPolicy = z.infer<
  typeof updateCancellationPolicySchema
>
export type UpdateConsultationSettingsSchema = z.infer<typeof consultationSettingsSchema>
