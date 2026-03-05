import { MercadoPagoTokenRepository } from '@/domain/payments/application/repositories/mercado-pago-token.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

@Controller('/mercado-pago')
export class MercadoPagoAccountController {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly mercadoPagoTokenRepository: MercadoPagoTokenRepository,
  ) {}

  @Get('/status')
  async getStatus(@CurrentUser() { sub: userId }: UserPayload) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new HttpException('Professional not found', HttpStatus.NOT_FOUND)
    }

    const token = await this.mercadoPagoTokenRepository.findByProfessionalId(
      professional.id.toString(),
    )

    const status = !token
      ? 'DISCONNECTED'
      : token.isExpired()
        ? 'ERROR'
        : 'CONNECTED'

    return {
      connected: status === 'CONNECTED',
      status,
      mpUserId: token?.mpUserId ?? null,
      tokenExpiresAt: token?.expiresAt ?? null,
      connectedAt: token?.createdAt ?? null,
    }
  }

  @Delete('/disconnect')
  async disconnect(@CurrentUser() { sub: userId }: UserPayload) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new HttpException('Professional not found', HttpStatus.NOT_FOUND)
    }

    await this.mercadoPagoTokenRepository.delete(professional.id.toString())

    return { disconnected: true }
  }
}
