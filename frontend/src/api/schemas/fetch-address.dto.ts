import z from 'zod'

export const fetchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  organizationId: z.string().nullable(),
  country: z.string(),
})

export type FetchAddress = z.infer<typeof fetchAddressSchema>
