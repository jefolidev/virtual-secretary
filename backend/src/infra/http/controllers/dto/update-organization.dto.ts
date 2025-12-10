import z from 'zod'

export const updateOrganizationBodySchema = z.object({
  name: z.string().min(1, 'You should insert a new name to organization.'),
})

export type UpdateOrganizationBodySchema = z.infer<
  typeof updateOrganizationBodySchema
>
