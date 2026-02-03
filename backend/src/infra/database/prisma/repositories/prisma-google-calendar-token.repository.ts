import {
  GoogleCalendarTokenData,
  GoogleCalendarTokenRepository,
} from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaGoogleCalendarTokenRepository implements GoogleCalendarTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: GoogleCalendarTokenData): Promise<void> {
    await this.prisma.googleCalendarToken.create({
      data: {
        professionalId: data.professionalId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType ?? 'Bearer',
        expiryDate: data.expiryDate ? BigInt(data.expiryDate) : null,
        scope: data.scope,
        googleAccountEmail: data.googleAccountEmail,
      },
    })
  }

  async findByProfessionalId(
    professionalId: string,
  ): Promise<GoogleCalendarTokenData | null> {
    const token = await this.prisma.googleCalendarToken.findUnique({
      where: { professionalId },
    })

    if (!token) return null

    return {
      professionalId: token.professionalId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
      expiryDate: token.expiryDate ? Number(token.expiryDate) : null,
      scope: token.scope,
      googleAccountEmail: token.googleAccountEmail,
    }
  }

  async update(
    professionalId: string,
    data: Partial<GoogleCalendarTokenData>,
  ): Promise<void> {
    await this.prisma.googleCalendarToken.update({
      where: { professionalId },
      data: {
        ...(data.accessToken && { accessToken: data.accessToken }),
        ...(data.refreshToken && { refreshToken: data.refreshToken }),
        ...(data.expiryDate !== undefined && {
          expiryDate: data.expiryDate ? BigInt(data.expiryDate) : null,
        }),
        ...(data.scope !== undefined && { scope: data.scope }),
        ...(data.googleAccountEmail !== undefined && {
          googleAccountEmail: data.googleAccountEmail,
        }),
      },
    })
  }

  async delete(professionalId: string): Promise<void> {
    await this.prisma.googleCalendarToken.delete({
      where: { professionalId },
    })
  }
}
