import z from 'zod'

export const forgotPasswordBodySchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPasswordConfirmation: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
})

export type ForgotPasswordBodySchema = z.infer<typeof forgotPasswordBodySchema>
