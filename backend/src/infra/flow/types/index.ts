import { ConversationSessionStatus, Session, User } from '@prisma/client'

export interface FieldsData<T> {
  data: T
  missingFields: string[]
}

export interface FlowInput {
  aiResult: any
  session: Session
  user: User
  message: string
}

export type ConversationSession<
  F extends keyof FlowContextMap = keyof FlowContextMap,
> = {
  id: string
  userId: string
  whatsappNumber: string
  currentFlow: F | null
  currentStep: string
  contextData: FlowContextMap[F] & {
    missingFields?: string[]
    whatsappNumber: string
  }
  status: ConversationSessionStatus
}

export interface FlowContextMap {
  registration: RegistrationContext
  appointment: AppointmentContext
  reschedule: RescheduleContext
  cancel: CancelContext
}

export interface AppointmentContext {
  data: Partial<{
    professionalName?: string
    modality?: 'ONLINE' | 'IN_PERSON'
    startDateTime?: Date
    clientId?: string

    paymentStatus?: 'PAID' | 'PENDING' | 'CANCELLED'
  }>
}

export enum AppointmentFlowSteps {
  START = 'START',
  ASK_SCHEDULE_DATA = 'ASK_SCHEDULE_DATA',
  COLLECT_DATA = 'COLLECT_DATA',
  LIST_PROFESSIONALS = 'LIST_PROFESSIONALS',
  ASK_PROFESSIONAL = 'ASK_PROFESSIONAL',
  ASK_DATE_TIME = 'ASK_DATE_TIME',
  ASK_MODALITY = 'ASK_MODALITY',
  CONFIRM_APPOINTMENT = 'CONFIRM_APPOINTMENT',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  DECLINE_APPOINTMENT = 'DECLINE_APPOINTMENT',
  CANCELED = 'CANCELED',
  CHANGE_DATA = 'CHANGE_DATA',
}

export interface RegistrationContext {
  data: Partial<{
    name: string
    email: string
    cpf: string
    gender: 'MALE' | 'FEMALE' | 'OTHER'
    birthDate: Date
    extraPreferences: string
    periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
    complement: string | null
    cep: string
    number: string
  }>
  whatsappNumber: string
}

export enum RegistrationFlowSteps {
  START = 'START',
  ASK_CONFIRMATION = 'ASK_CONFIRMATION',
  AWAITING_REGISTRATION_CONFIRMATION = 'AWAITING_REGISTRATION_CONFIRMATION',
  COLLECT_DATA = 'COLLECT_DATA',
  FINISHED = 'FINISHED',
}

export interface RescheduleContext {}

export interface CancelContext {}

export enum ConversationFlow {
  REGISTRATION = 'registration',
  SCHEDULE_APPOINTMENT = 'schedule_appointment',
  RESCHEDULE = 'reschedule',
  APPOINTMENT_CANCEL = 'appointment_cancel',
  LIST_PROFESSIONAL = 'list_professional',
  LIST_CLIENT_APPOINTMENT = 'list_client_appointments',
  GENERAL_CHAT = 'general_chat',
}
