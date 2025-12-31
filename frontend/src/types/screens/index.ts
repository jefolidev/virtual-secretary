export const ScreensEnum = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
} as const

export type ScreensEnum = (typeof ScreensEnum)[keyof typeof ScreensEnum]
