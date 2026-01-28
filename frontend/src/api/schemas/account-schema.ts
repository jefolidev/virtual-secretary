import { RoleEnum } from '@/types/roles'
import z from 'zod'
import { addressSchema } from './address-schema'

const PeriodPreferenceEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING'])
const GenderEnum = z.enum(['MALE', 'FEMALE'])

const NotificationType = z.enum([
  'NEW_APPOINTMENT',
  'CANCELLATION',
  'CONFIRMATION',
  'DAILY_SUMMARY',
  'CONFIRMED_LIST',
  'PAYMENT_STATUS',
])

const clientDataSchema = z.object({
  periodPreference: z.array(PeriodPreferenceEnum).optional().default([]),
  extraPreference: z.string().optional(),
})

const notificationSettings = z.object({
  enabledTypes: z
    .array(NotificationType)
    .min(1, 'Selecione ao menos um tipo de notificação'),
  reminderBeforeMinutes: z
    .number()
    .min(5, 'O lembrete deve ser de no mínimo 5 minutos antes')
    .max(1440, 'O lembrete deve ser de no máximo 1440 minutos antes'),
  dailySummaryTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido, esperado HH:MM'),
})

const professionalDataSchema = z.object({
  sessionPrice: z
    .number()
    .min(0, 'O preço da sessão deve ser maior ou igual a 0'),
  notificationSettings: notificationSettings,
})

export const userAccountSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
    role: RoleEnum,
    address: addressSchema,
    birthDate: z.coerce.date(),
    gender: GenderEnum,
    clientDataSchema: clientDataSchema.optional(),
    professionalDataSchema: professionalDataSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
  })

export type UserAccountSchema = z.infer<typeof userAccountSchema>
