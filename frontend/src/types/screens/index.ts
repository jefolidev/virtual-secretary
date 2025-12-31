export const ScreensEnum = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
} as const

export type ScreensEnum = (typeof ScreensEnum)[keyof typeof ScreensEnum]
