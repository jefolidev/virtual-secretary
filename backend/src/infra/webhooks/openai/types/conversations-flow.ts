export type ConversationStatus =
  | 'initial'
  | 'awaiting_registration_confirmation'
  | 'collecting_registration_data'
  | 'registered'
  | 'listing_professionals'
  | 'selecting_professional'
  | 'scheduling_appointment'
  | 'collecting_appointment_data'
  | 'confirming_appointment'

export type ConversationFlow =
  | 'create_client_account'
  | 'list_professionals'
  | 'get_professional_schedule_settings'
  | 'get_available_slots'
  | 'check_slot_availability'
  | 'check_slot_availability_by_day'
  | 'authenticate_user'
  | 'schedule_appointment'
  | 'list_client_appointments'
  | 'check_future_appointment'
  | 'create_feedback'
  | 'schedule_notifications'
  | 'general_chat'

export interface CreateClientAccountData {
  name: string
  email: string
  cpf: string
  birthDate: string
  gender: 'MALE' | 'FEMALE'
  cep: string
  number: string
  complement?: string
  periodPreference: Array<'MORNING' | 'AFTERNOON' | 'EVENING'>
}

export interface AppointmentData {
  professionalId: string
  date: string
  time: string
  notes?: string
}

export interface ProfessionalListData {
  page: number
  professionals?: Array<{
    id: string
    name: string
    specialty: string
  }>
}

export interface ConversationContext {
  flow: ConversationFlow
  status?: ConversationStatus
  createClientAccountData?: Partial<CreateClientAccountData>
  appointmentData?: Partial<AppointmentData>
  professionalListData?: Partial<ProfessionalListData>
  lastInteraction?: Date
  data?: any
}

export interface ParsedDataResult<T = any> {
  data?: T
  error?: string
}

export interface FunctionCallHandler {
  name: string
  handler: (args: any, context: ConversationContext) => Promise<string>
}
