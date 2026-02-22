import { fetchAddressSchema } from '@/api/schemas/fetch-address.dto'
import z from 'zod'

export const appointmentsStatusEnum = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'CANCELLED',
  'RESCHEDULED',
  'NO_SHOW',
  'IN_PROGRESS',
  'COMPLETED',
])

export type AppointmentsStatus = z.infer<typeof appointmentsStatusEnum>

export const paymentStatusEnum = z.enum([
  'PENDING',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED',
])

export type PaymentStatus = z.infer<typeof paymentStatusEnum>

export const appointmentModalitiesEnum = z.enum(['IN_PERSON', 'ONLINE'])

export type AppointmentModalities = z.infer<typeof appointmentModalitiesEnum>

export const appointments = z.object({
  id: z.uuid(),
  professionalId: z.string(),
  clientId: z.string(),
  modality: appointmentModalitiesEnum,
  googleMeetLink: z.string().nullable(),
  rescheduleDateTime: z.date().nullable(),
  status: appointmentsStatusEnum,

  evaluation: z
    .object({
      id: z.uuid(),
      appointmentId: z.uuid(),
      score: z.number().min(1).max(10),
      comment: z.string().nullable(),
      createdAt: z.date(),
    })
    .optional()
    .nullable(),

  agreedPrice: z.number(),
  paymentStatus: paymentStatusEnum,
  paymentExpiresAt: z.date().nullable(),
  currentTransactionId: z.string().nullable(),

  startDateTime: z.date(),
  endDateTime: z.date(),

  startedAt: z.date().nullable(),
  totalElapsedMs: z.number().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Appointment = z.infer<typeof appointments>

export const fetchProfessionalSchedulesSchema = z.object({
  ...appointments.shape,

  notifications: z.array(
    z.object({
      reminderType: z.enum([
        'NEW_APPOINTMENT',
        'CANCELLATION',
        'CONFIRMATION',
        'DAILY_SUMMARY',
        'CONFIRMED_LIST',
        'PAYMENT_STATUS',
        'WELCOME',
        'REMOVAL',
        'FIRST_REMINDER',
        'USER_CONFIRMATION',
        'FINAL_REMINDER',
      ]),
      createdAt: z.date(),
      readAt: z.date().nullable(),
    }),
  ),

  userDetails: z.object({
    name: z.string(),
    whatsappNumber: z.string().nullable(),
    email: z.string().nullable(),
    cpf: z.string().nullable(),
    gender: z.string().nullable(),
    extraPreference: z.string().nullable(),
    periodPreference: z.string().nullable(),

    address: z.object({ props: fetchAddressSchema }),
  }),
})

export type FetchProfessionalSchedulesSchema = z.infer<
  typeof fetchProfessionalSchedulesSchema
>
