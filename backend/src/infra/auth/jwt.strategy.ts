import { TokenInvalidator } from '@/domain/scheduling/application/cryptography/token-invalidator'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import z from 'zod'
import { EnvService } from '../env/env.service'

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>

const extractTokenFromCookie = (request: Request): string | null => {
  // Aqui você poderia usar a lógica do seu decorator
  const token = request?.cookies?.['access_token']

  if (!token) {
    return null
  }

  // Adicionar validações extras se necessário
  return token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: EnvService,
    private readonly tokenInvalidator: TokenInvalidator
  ) {
    const publicKey = config.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromCookie]),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
      passReqToCallback: true, // Necessário para acessar o request e o token
    })
  }

  async validate(request: Request, payload: UserPayload) {
    const token = extractTokenFromCookie(request)

    if (!token) {
      throw new UnauthorizedException('Token não encontrado')
    }

    // Verificar se o token está na blacklist
    const isInvalidated = await this.tokenInvalidator.isInvalidated(token)
    if (isInvalidated) {
      throw new UnauthorizedException('Token invalidado')
    }

    return tokenPayloadSchema.parse(payload)
  }
}
