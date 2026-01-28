import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Dados de mock simplificados para o seed
  const professionals = [
    {
      name: 'Dr. Carlos Silva',
      email: 'carlos.silva@email.com',
      cpf: '12345678901',
      whatsappNumber: '11987654321',
      password: 'hashed_password',
      gender: 'MALE' as const,
      birthDate: new Date('1985-05-15'),
      sessionPrice: 150.0,
      address: {
        addressLine1: 'Rua das Flores, 123',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01234567',
        country: 'Brasil',
      },
    },
    {
      name: 'Dra. Ana Costa',
      email: 'ana.costa@email.com',
      cpf: '98765432101',
      whatsappNumber: '11876543210',
      password: 'hashed_password',
      gender: 'FEMALE' as const,
      birthDate: new Date('1990-08-22'),
      sessionPrice: 180.0,
      address: {
        addressLine1: 'Av. Paulista, 456',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310100',
        country: 'Brasil',
      },
    },
    {
      name: 'Dr. Pedro Santos',
      email: 'pedro.santos@email.com',
      cpf: '11122233301',
      whatsappNumber: '11765432109',
      password: 'hashed_password',
      gender: 'MALE' as const,
      birthDate: new Date('1982-11-10'),
      sessionPrice: 200.0,
      address: {
        addressLine1: 'Rua Augusta, 789',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01305000',
        country: 'Brasil',
      },
    },
  ]

  for (const professionalData of professionals) {
    try {
      const createdUser = await prisma.user.create({
        data: {
          name: professionalData.name,
          email: professionalData.email,
          cpf: professionalData.cpf,
          whatsappNumber: professionalData.whatsappNumber,
          role: 'PROFESSIONAL',
          password: professionalData.password,
          gender: professionalData.gender,
          birthDate: professionalData.birthDate,
          address: {
            create: professionalData.address,
          },
          professional: {
            create: {
              sessionPrice: professionalData.sessionPrice,
              notificationSettings: {
                create: {
                  enabledTypes: ['CONFIRMATION', 'CANCELLATION'],
                  reminderBeforeMinutes: 15,
                  dailySummaryTime: '09:00',
                },
              },
              cancellationPolicy: {
                create: {
                  description: 'Política padrão de cancelamento',
                  minHoursBeforeCancellation: 24,
                  minDaysBeforeNextAppointment: 1,
                  cancellationFeePercentage: 0.5,
                  allowReschedule: true,
                },
              },
              scheduleConfiguration: {
                create: {
                  workingDays: [1, 2, 3, 4, 5], // Segunda a sexta
                  workStartHour: '08:00',
                  workEndHour: '18:00',
                  sessionDurationMinutes: 60,
                  bufferIntervalMinutes: 15,
                  enableGoogleMeet: true,
                },
              },
            },
          },
        },
        include: {
          address: true,
          professional: {
            include: {
              notificationSettings: true,
              cancellationPolicy: true,
              scheduleConfiguration: true,
            },
          },
        },
      })

      console.log(
        `Created professional: ${createdUser.name} (ID: ${createdUser.professionalId})`,
      )
    } catch (e) {
      console.error(`Error creating professional ${professionalData.name}:`, e)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
