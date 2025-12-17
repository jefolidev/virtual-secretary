import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'

import { ProfessionalWithNotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/professional-with-notification-settings'
import { Injectable } from '@nestjs/common'
import { PrismaProfessionalMapper } from '../../mappers/prisma-professional-mapper'
import { PrismaProfessionalWithNotificationSettingsMapper } from '../../mappers/prisma-professional-with-notification-settings-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProfessionalRepository implements ProfessionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfessionalIdWithNotificationSettings(
    professionalId: string
  ): Promise<ProfessionalWithNotificationSettings | null> {
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        notificationSettings: true,
      },
    })

    if (!professional || !professional.notificationSettings) {
      return null
    }

    return PrismaProfessionalWithNotificationSettingsMapper.toDomain(
      professional
    )
  }

  async create(professional: Professional): Promise<void> {
    // Primeiro, criar o NotificationSettings se existir
    let notificationSettingsId: string | undefined

    if (professional.notificationSettings) {
      const notificationSettingsData = {
        channels: professional.notificationSettings.channels,
        enabledTypes: professional.notificationSettings.enabledTypes,
        reminderBeforeMinutes:
          professional.notificationSettings.reminderBeforeMinutes,
        dailySummaryTime: professional.notificationSettings.dailySummaryTime,
      }

      const createdNotificationSettings =
        await this.prisma.notificationSettings.create({
          data: notificationSettingsData,
        })

      notificationSettingsId = createdNotificationSettings.id
    }

    // Depois, criar o Professional com o notificationSettingsId
    const data = {
      ...PrismaProfessionalMapper.toPrisma(professional),
      notificationSettingsId,
    }

    await this.prisma.professional.create({
      data,
    })
  }

  async findMany(params: { page: number }): Promise<Professional[]> {
    const professionals = await this.prisma.professional.findMany({
      take: 10,
      skip: params.page ? (params.page - 1) * 10 : 0,
      include: {
        user: true,
        cancellationPolicy: true,
        scheduleConfiguration: true,
      },
    })

    return professionals.map(PrismaProfessionalMapper.toDomain)
  }

  async findById(id: string): Promise<Professional | null> {
    const professional = await this.prisma.professional.findFirst({
      where: {
        id,
      },
      include: {
        user: true,
      },
    })

    if (!professional) {
      return null
    }

    return PrismaProfessionalMapper.toDomain(professional)
  }

  async findByUserId(id: string): Promise<Professional | null> {
    const professional = await this.prisma.professional.findFirst({
      where: {
        user: { id },
      },
      include: {
        user: true,
      },
    })

    if (!professional) {
      return null
    }

    return PrismaProfessionalMapper.toDomain(professional)
  }

  async assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void> {
    await this.prisma.professional.update({
      where: { id: professionalId },
      data: { cancellationPolicyId },
    })
  }

  async save(professional: Professional): Promise<void> {
    const data = PrismaProfessionalMapper.toPrisma(professional)

    await Promise.all([
      this.prisma.professional.update({
        where: { id: professional.id.toString() },
        data,
      }),
    ])
  }
}
