export interface IAddress {
  addressLine1: string
  addressLine2?: string | null
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
}
