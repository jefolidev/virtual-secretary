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

// Nova função: extrai token do cookie OU do header Authorization
const extractTokenFromCookieOrHeader = (request: Request): string | null => {
  // Tenta pegar do cookie primeiro
  const cookieToken = request?.cookies?.['access_token']
  if (cookieToken) {
    return cookieToken
  }

  // Se não encontrar no cookie, tenta pegar do header Authorization
  const authHeader = request?.headers?.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7) // Remove "Bearer " do início
  }

  return null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: EnvService,
    private readonly tokenInvalidator: TokenInvalidator,
  ) {
    const publicKey = config.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractTokenFromCookieOrHeader,
      ]),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: UserPayload) {
    const token = extractTokenFromCookieOrHeader(request)

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
