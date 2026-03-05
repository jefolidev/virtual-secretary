import { PaymentGateway } from '@/domain/payments/application/gateway/payment-gateway'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MercadoPagoPaymentGateway } from './mercado-pago-payment.gateway'
import { MercadoPagoService } from './mercado-pago.service'

@Module({
  imports: [ConfigModule],
  providers: [
    MercadoPagoService,
    {
      provide: PaymentGateway,
      useClass: MercadoPagoPaymentGateway,
    },
  ],
  exports: [PaymentGateway, MercadoPagoService],
})
export class MercadoPagoModule {}
