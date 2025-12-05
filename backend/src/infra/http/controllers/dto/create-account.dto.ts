import z from 'zod'

// Enums (kept as requested)
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

// DTO for client in general
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

export const createUserAccountBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email format'),
  cpf: z.string().min(11, 'CPF must have at least 11 digits').max(14),
  phone: z.string().min(10, 'Phone must have at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: RoleEnum,
  address: addressSchema,
  clientData: clientDataSchema.optional(),
})

export type CreateUserAccountBodySchema = z.infer<
  typeof createUserAccountBodySchema
>
