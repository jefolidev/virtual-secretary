export const signupSteps = {
  USER_TYPE: 0,
  ACCOUNT_DETAILS: 1,
  PATIENT_PREFERENCES: 2, // Apenas para pacientes
  PROFESSIONAL_CANCELLATION: 2, // Para profissionais
  PROFESSIONAL_SCHEDULING: 3, // Para profissionais
  PROFESSIONAL_NOTIFICATIONS: 4, // Para profissionais
  ADDRESS_DETAILS: 5, // Final para ambos
} as const

export type SignupStep = (typeof signupSteps)[keyof typeof signupSteps]
