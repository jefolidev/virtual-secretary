import z from 'zod'

//
const RoleEnum = z.enum(['CLIENT', 'PROFESSIONAL'])
const GenderEnum = z.enum(['MALE', 'FEMALE'])
const PeriodPreferenceEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING'])

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
  extraPreferences: z.string().optional(),
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

const cancellationPolicySchema = z.object({
  minHoursBeforeCancellation: z
    .number()
    .min(6, 'O mínimo de horas para cancelar é 6'),
  minDaysBeforeNextAppointment: z
    .number()
    .min(1, 'O mínimo de dias para próximo agendamento é 1'),
  cancelationFeePercentage: z.number().min(0).max(100),
  allowReschedule: z.boolean(),
  description: z.string().optional(),
})

const scheduleConfigurationSchema = z.object({
  bufferIntervalMinutes: z.number().min(0),
  daysOfWeek: z.array(z.number().min(0).max(6)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  holidays: z.array(z.string()).default([]),
  sessionDurationMinutes: z.number().min(1),
})

const professionalDataSchema = z.object({
  sessionPrice: z
    .number()
    .min(0, 'Session price must be a non-negative number'),
  notificationSettings: notificationSettings,
  cancellationPolicy: cancellationPolicySchema.optional(),
  scheduleConfiguration: scheduleConfigurationSchema.optional(),
})

export const createUserAccountBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email format'),
  cpf: z.string().min(11, 'CPF must have at least 11 digits').max(14),
  whatsappNumber: z.string().min(10, 'Phone must have at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: GenderEnum,
  birthDate: z.coerce.date(),
  role: RoleEnum,
  address: addressSchema,
  clientData: clientDataSchema.optional(),
  professionalData: professionalDataSchema.optional(),
})

export type CreateUserAccountBodySchema = z.infer<
  typeof createUserAccountBodySchema
>
