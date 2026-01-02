import z from 'zod'

//
const RoleEnum = z.enum(['CLIENT', 'PROFESSIONAL'])
const PeriodPreferenceEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING'])

const NotificationChannelEnum = z.enum(['EMAIL', 'WHATSAPP'])

const NotificationType = z.enum([
  'NEW_APPOINTMENT',
  'CANCELLATION',
  'CONFIRMATION',
  'DAILY_SUMMARY',
  'CONFIRMED_LIST',
  'PAYMENT_STATUS',
])

const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(8, 'Postal code must have at least 8 characters'),
  country: z.string().min(1, 'Country is required').default('Brasil'),
})

const clientDataSchema = z.object({
  periodPreference: z.array(PeriodPreferenceEnum).optional().default([]),
  extraPreference: z.string().optional(),
})

const notificationSettings = z.object({
  channels: z
    .array(NotificationChannelEnum)
    .min(1, 'Selecione ao menos um canal'),
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
    .min(0, 'Session price must be a non-negative number'),
  notificationSettings: notificationSettings,
})

export const createUserAccountBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email format'),
  cpf: z.string().min(11, 'CPF must have at least 11 digits').max(14),
  phone: z.string().min(10, 'Phone must have at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: RoleEnum,
  address: addressSchema,
  clientData: clientDataSchema.optional(),
  professionalData: professionalDataSchema.optional(),
})

export type CreateUserAccountBodySchema = z.infer<
  typeof createUserAccountBodySchema
>
