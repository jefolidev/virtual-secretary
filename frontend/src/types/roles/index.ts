import z from 'zod'

export const RoleEnum = z.enum(['CLIENT', 'PROFESSIONALexport '])
export type Role = z.infer<typeof RoleEnum>
