import z from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string(),
  cnpj: z.string(),
  professionalsIds: z.array(z.uuid()).optional(),
  address: z.object({
    addressLine1: z.string().min(1, 'Address must be provided'),
    addressLine2: z.string().optional(),
    neighborhood: z.string().min(1, 'Neighborhood must be provided'),
    city: z.string().min(1, 'City must be provided'),
    state: z.string().min(1, 'State must be provided'),
    postalCode: z.string().min(8, 'Postal code must be provided'),
    country: z.string().min(1, 'Country must be provided').default('Brasil'),
  }),
})

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>
