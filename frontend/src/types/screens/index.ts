export const ScreensEnum = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  CALENDAR: 'calendar',
  SETTINGS: 'settings',
  CLIENTS: 'clients',
  FINANCE: 'finance',
  ANALYTICS: 'analytics',
} as const

export type ScreensEnum = (typeof ScreensEnum)[keyof typeof ScreensEnum]
