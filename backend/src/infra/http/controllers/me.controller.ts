import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Controller, Get, NotFoundException } from '@nestjs/common'

@Controller('/me')
export class MeController {
  constructor(private readonly user: UserRepository) {}

  @Get()
  async handle(@CurrentUser() { sub: userId }: UserPayload) {
    const user = await this.user.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      user_id: user.id.toString(),
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      whatsappNumber: user.whatsappNumber,
      gender: user.gender,
      birth_date: user.birthDate,
      role: user.role,
      professional_id: user.professionalId?.toString(),
      client_id: user.clientId?.toString(),
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }
  }
}
