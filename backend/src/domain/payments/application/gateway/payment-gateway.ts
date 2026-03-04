export interface CreatePaymentPreferenceInput {
  externalReference: string
  title: string
  amount: number
  payerEmail: string
  professionalAccessToken?: string
  paymentMethodId?: 'pix' | 'credit_card' | 'debit_card'
}

export interface CreatePaymentPreferenceOutput {
  preferenceId: string
  checkoutUrl: string
}

export interface PaymentDetails {
  paymentId: string
  status: string
  statusDetail: string
  externalReference: string
  amount: number
  paidAt: Date | null
}

export abstract class PaymentGateway {
  abstract createPreference(
    input: CreatePaymentPreferenceInput,
  ): Promise<CreatePaymentPreferenceOutput>

  abstract getPaymentDetails(paymentId: string): Promise<PaymentDetails>
}
