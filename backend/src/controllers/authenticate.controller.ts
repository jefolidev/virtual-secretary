import { Controller, Post } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Controller('/sessions')
export class AuthenticateController {
  constructor(private readonly jwt: JwtService) {}

  @Post()
  async handle() {
    const token = this.jwt.sign({ sub: 'user-id' })

    return token
  }
}
