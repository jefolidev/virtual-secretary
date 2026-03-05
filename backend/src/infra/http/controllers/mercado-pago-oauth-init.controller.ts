import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { MercadoPagoService } from '@/infra/webhooks/mercado-pago/mercado-pago.service'
import { Controller, Get, HttpException, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('/mercado-pago')
export class MercadoPagoOAuthInitController {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  @Get('/connect')
  async connect(
    @CurrentUser() { sub: userId }: UserPayload,
    @Res() res: Response,
  ) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new HttpException('Professional not found', HttpStatus.NOT_FOUND)
    }

    try {
      const authUrl = this.mercadoPagoService.buildOAuthUrl(
        professional.id.toString(),
      )

      console.log(authUrl)

      return res.redirect(authUrl)
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'MERCADO_PAGO_NOT_CONFIGURED'
      ) {
        throw new HttpException(
          'Integração com Mercado Pago não está configurada no servidor.',
          HttpStatus.SERVICE_UNAVAILABLE,
        )
      }
      throw err
    }
  }

  @Get('/connect-url')
  async getConnectUrl(@CurrentUser() { sub: userId }: UserPayload) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new HttpException('Professional not found', HttpStatus.NOT_FOUND)
    }

    try {
      const url = this.mercadoPagoService.buildOAuthUrl(
        professional.id.toString(),
      )

      console.log(url)
      return { url }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'MERCADO_PAGO_NOT_CONFIGURED'
      ) {
        throw new HttpException(
          'Integração com Mercado Pago não está configurada no servidor.',
          HttpStatus.SERVICE_UNAVAILABLE,
        )
      }
      throw err
    }
  }
}
