import { z } from 'zod'

export const updateUserAccountSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  cpf: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      'CPF deve estar no formato XXX.XXX.XXX-XX',
    )
    .optional(),
  whatsappNumber: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Telefone deve estar no formato (XX) XXXXX-XXXX',
    )
    .optional(),
})

export const updateUserNotificationsSchema = z.object({
  notifications: z.object({
    newAppointments: z.boolean(),
    cancellations: z.boolean(),
    confirmations: z.boolean(),
    dailySummary: z.boolean(),
    confirmedList: z.boolean(),
    payments: z.boolean(),
  }),
  notificationChannels: z.object({
    email: z.boolean(),
    whatsapp: z.boolean(),
  }),
})

export const updateUserConsultationsSchema = z.object({
  consultations: z.object({
    workDays: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }),
    appointmentDuration: z.number().min(1, 'Duração deve ser maior que 0'),
    breakTime: z.number().min(0, 'Tempo de intervalo não pode ser negativo'),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
    sessionPrice: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
    minHoursBeforeCancellation: z
      .number()
      .min(0, 'Horas mínimas não podem ser negativas'),
    cancelationFeePercentage: z
      .number()
      .min(0)
      .max(100, 'Percentual deve estar entre 0 e 100'),
    minDaysBeforeNextAppointment: z.number().min(1, 'Mínimo de 1 dia'),
    allowReschedule: z.boolean(),
    cancellationPolicy: z.string().optional(),
  }),
})

export type UpdateUserAccountSchema = z.infer<typeof updateUserAccountSchema>

export type UpdateUserNotificationsSchema = z.infer<
  typeof updateUserNotificationsSchema
>

export type UpdateUserConsultationsSchema = z.infer<
  typeof updateUserConsultationsSchema
>
