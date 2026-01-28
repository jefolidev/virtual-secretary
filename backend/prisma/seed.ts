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

  // Criação de um cliente
  let createdClient: any
  try {
    createdClient = await prisma.user.create({
      data: {
        name: 'Cliente Exemplo',
        email: 'cliente@email.com',
        cpf: '22233344455',
        whatsappNumber: '11999998888',
        role: 'CLIENT',
        password: 'hashed_password',
        gender: 'MALE',
        birthDate: new Date('1995-03-20'),
        address: {
          create: {
            addressLine1: 'Rua do Cliente, 100',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01001000',
            country: 'Brasil',
          },
        },
        client: {
          create: {},
        },
      },
      include: { address: true, client: true },
    })
    console.log(`Created client: ${createdClient.name}`)
  } catch (e) {
    console.error('Error creating client:', e)
    return
  }

  // Buscar profissionais criados
  const allProfessionals = await prisma.user.findMany({
    where: { role: 'PROFESSIONAL' },
    include: { professional: true },
  })

  // Criar 10 agendamentos para o cliente, alternando entre os profissionais
  const now = new Date()
  for (let i = 0; i < 10; i++) {
    const professional = allProfessionals[i % allProfessionals.length]
    const appointmentDate = new Date(now)
    appointmentDate.setDate(now.getDate() + i + 1)
    appointmentDate.setHours(9 + (i % 8), 0, 0, 0) // horários variados entre 9h e 16h

    // Garante que o professional.professional existe
    if (!professional.professional) {
      console.warn(
        `Profissional sem registro em professional: ${professional.name}`,
      )
      continue
    }

    try {
      await prisma.appointment.create({
        data: {
          clientId: createdClient.client.id,
          professionalId: professional.professional.id,
          datetime: appointmentDate,
          modality: i % 2 === 0 ? 'ONLINE' : 'IN_PERSON', // Corrigido para 'IN_PERSON'
          status: 'SCHEDULED',
          price: professional.professional.sessionPrice ?? 100,
        },
      })
      console.log(
        `Created appointment ${i + 1} for client with professional ${professional.name}`,
      )
    } catch (e) {
      console.error(`Error creating appointment ${i + 1}:`, e)
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
