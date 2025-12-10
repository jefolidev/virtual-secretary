import z from 'zod'

export const removeProfessionalFromOrganizationBodySchema = z.object({
  professionalId: z
    .uuid('Provide a valid id.')
    .min(1, 'You must provide an id.'),
})

export type RemoveProfessionalFromOrganizationBodySchema = z.infer<
  typeof removeProfessionalFromOrganizationBodySchema
>
