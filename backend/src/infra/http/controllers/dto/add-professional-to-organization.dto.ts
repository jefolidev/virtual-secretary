import z from 'zod'

export const addProfessionalToOrganizationBodySchema = z.object({
  professionalId: z
    .uuid('Provide a valid id.')
    .min(1, 'You must provide an id.'),
})

export type AddProfessionalToOrganizationBodySchema = z.infer<
  typeof addProfessionalToOrganizationBodySchema
>
