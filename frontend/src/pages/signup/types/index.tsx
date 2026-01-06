export const signupSteps = {
  USER_TYPE: 0,
  ACCOUNT_DETAILS: 1,
  PATIENT_PREFERENCES: 2,
  PROFESSIONAL_CANCELLATION: 2,
  PROFESSIONAL_SCHEDULING: 3,
  PROFESSIONAL_NOTIFICATIONS: 4,
  ADDRESS_DETAILS: 5,
} as const

export type SignupStep = (typeof signupSteps)[keyof typeof signupSteps]
