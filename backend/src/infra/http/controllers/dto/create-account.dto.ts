import z from 'zod'

// Enums correspondentes
const RoleEnum = z.enum(['CLIENT', 'PROFESSIONAL'])
const PeriodPreferenceEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING'])
const WeekDaysEnum = z.enum([
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
])
const NotificationChannelEnum = z.enum(['EMAIL', 'WHATSAPP'])
const NotificationTypeEnum = z.enum([
  'NEW_APPOINTMENT',
  'CANCELLATION',
  'CONFIRMATION',
  'DAILY_SUMMARY',
  'CONFIRMED_LIST',
  'PAYMENT_STATUS',
])

// Schemas base
const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(8, 'Postal code must have at least 8 characters'),
  country: z.string().min(1, 'Country is required').default('Brasil'),
})

// Schema para NotificationSettings
const notificationSettingsSchema = z.object({
  channels: z.array(NotificationChannelEnum).default(['EMAIL', 'WHATSAPP']),
  enabledTypes: z
    .array(NotificationTypeEnum)
    .default(['CONFIRMATION', 'CANCELLATION']),
  reminderBeforeMinutes: z.number().int().min(0).default(10),
  dailySummaryTime: z.string().default('12:00'),
})

// Schema para CancellationPolicy
const cancellationPolicySchema = z.object({
  minHoursBeforeCancellation: z.number().int().min(0).default(6),
  minDaysBeforeNextAppointment: z.number().int().min(0).default(1),
  cancellationFeePercentage: z.number().min(0).max(100).default(0.6),
  allowReschedule: z.boolean().default(false),
  description: z.string().min(1, 'Description is required'),
})

// Schema para ScheduleConfiguration
const scheduleConfigurationSchema = z.object({
  workingDays: z
    .array(WeekDaysEnum)
    .default(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
  workStartHour: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid hour format (HH:MM)')
    .default('08:00'),
  workEndHour: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid hour format (HH:MM)')
    .default('18:00'),
  sessionDurationMinutes: z.number().int().min(1).default(60),
  bufferIntervalMinutes: z.number().int().min(0).default(10),
  holidays: z.array(z.string().datetime()).default([]),
  enableGoogleMeet: z.boolean().default(false),
})

// Schema para Client
const clientDataSchema = z.object({
  periodPreference: z.array(PeriodPreferenceEnum).optional().default([]),
  extraPreference: z.string().optional(),
})

// Schema para Professional
const professionalDataSchema = z.object({
  sessionPrice: z
    .number()
    .min(0, 'Session price cannot be negative')
    .default(0),
  organizationId: z.uuid('Invalid organization ID').optional(),
  notificationSettings: notificationSettingsSchema.optional(),
  cancellationPolicy: cancellationPolicySchema.optional(),
  scheduleConfiguration: scheduleConfigurationSchema.optional(),
})

// Schema principal com discriminated union (RECOMENDADO)
export const createAccountBodySchema = z.discriminatedUnion('role', [
  // Schema para PROFESSIONAL
  z.object({
    // Dados básicos obrigatórios
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    cpf: z.string().min(11, 'CPF must have at least 11 digits').max(14),
    phone: z.string().min(9, 'Phone must have at least 9 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.literal('PROFESSIONAL'),

    // Endereço obrigatório
    address: addressSchema,

    // Dados específicos do profissional
    professionalData: professionalDataSchema,

    // clientData não deve existir para profissional
    clientData: z.undefined(),
  }),

  // Schema para CLIENT
  z.object({
    // Dados básicos obrigatórios
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    cpf: z.string().min(11, 'CPF must have at least 11 digits').max(14),
    phone: z.string().min(10, 'Phone must have at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.literal('CLIENT'),

    // Endereço obrigatório
    address: addressSchema,

    // Dados específicos do cliente
    clientData: clientDataSchema.optional(),

    // professionalData não deve existir para cliente
    professionalData: z.undefined(),
  }),
])

// Versão alternativa sem discriminated union (mais simples)
export const createAccountBodySchemaSimple = z
  .object({
    // Dados básicos obrigatórios
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    cpf: z.string().min(11, 'CPF must have at least 11 digits').max(14),
    phone: z.string().min(10, 'Phone must have at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),

    // Role obrigatório
    role: RoleEnum,

    // Endereço obrigatório
    address: addressSchema,

    // Dados opcionais específicos (usar conforme role)
    professionalData: professionalDataSchema.optional(),
    clientData: clientDataSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Validações condicionais

    if (data.role === 'PROFESSIONAL') {
      if (!data.professionalData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'professionalData is required for PROFESSIONAL role',
          path: ['professionalData'],
        })
      }

      // Se tiver clientData, é inválido
      if (data.clientData !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'clientData should not be provided for PROFESSIONAL role',
          path: ['clientData'],
        })
      }
    }

    if (data.role === 'CLIENT') {
      // Se tiver professionalData, é inválido
      if (data.professionalData !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'professionalData should not be provided for CLIENT role',
          path: ['professionalData'],
        })
      }
    }
  })

// Tipo inferido
export type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>
export type CreateAccountBodySchemaSimple = z.infer<
  typeof createAccountBodySchemaSimple
>

// Tipos auxiliares para cada role
export type ProfessionalAccountData = Extract<
  CreateAccountBodySchema,
  { role: 'PROFESSIONAL' }
>
export type ClientAccountData = Extract<
  CreateAccountBodySchema,
  { role: 'CLIENT' }
>
