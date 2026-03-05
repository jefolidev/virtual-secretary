import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { getQueueToken } from '@nestjs/bullmq'
import { NestFactory } from '@nestjs/core'
import { Queue } from 'bullmq'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const prisma = app.get(PrismaService)
  const remindersQueue = app.get<Queue>(getQueueToken('whatsapp-reminders'))

  console.log('🔍 Buscando appointments confirmados de hoje às 18h...\n')

  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    18,
    0,
    0,
  )
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    18,
    59,
    59,
  )

  const appointments = await prisma.appointment.findMany({
    where: {
      startDateTime: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: 'CONFIRMED',
    },
  })

  console.log(
    `📋 Encontrados ${appointments.length} appointment(s) confirmado(s)\n`,
  )

  if (appointments.length === 0) {
    console.log('❌ Nenhum appointment encontrado')
    await app.close()
    return
  }

  for (const appointment of appointments) {
    console.log(`\n📅 Appointment ID: ${appointment.id}`)
    console.log(
      `   Horário: ${appointment.startDateTime.toLocaleString('pt-BR')}`,
    )
    console.log(`   Status: ${appointment.status}`)

    // Buscar reminders do appointment
    const reminders = await prisma.appointmentReminder.findMany({
      where: { appointmentId: appointment.id },
    })

    console.log(
      `   Lembretes enviados: ${reminders.map((r) => r.type).join(', ') || 'nenhum'}`,
    )

    const hasT2H = reminders.some((r) => r.type === 'T2H_REMINDER' && r.sentAt)
    const hasT30M = reminders.some(
      (r) => r.type === 'T30M_REMINDER' && r.sentAt,
    )

    if (!hasT2H) {
      console.log('\n   ⚡ Enviando T2H reminder agora...')
      try {
        const job = await remindersQueue.add(
          'send-2h-reminder',
          { appointmentId: appointment.id },
          { delay: 0 }, // Envio imediato
        )
        console.log(`   ✅ Job T2H adicionado: ${job.id}`)
      } catch (err) {
        console.error(`   ❌ Erro ao adicionar job T2H:`, err)
      }
    } else {
      console.log('   ⏭️  T2H reminder já foi enviado')
    }

    if (!hasT30M) {
      const now = Date.now()
      const appointmentTime = new Date(appointment.startDateTime).getTime()
      const delay30min = appointmentTime - 30 * 60 * 1000 - now

      if (delay30min <= 0) {
        console.log('   ⚡ Enviando T30M reminder agora...')
        try {
          const job = await remindersQueue.add(
            'send-30min-reminder',
            { appointmentId: appointment.id },
            { delay: 0 },
          )
          console.log(`   ✅ Job T30M adicionado: ${job.id}`)
        } catch (err) {
          console.error(`   ❌ Erro ao adicionar job T30M:`, err)
        }
      } else {
        const minutesLeft = Math.floor(delay30min / 60000)
        console.log(
          `   ⏰ T30M reminder agendado para daqui a ${minutesLeft} minutos`,
        )
      }
    } else {
      console.log('   ⏭️  T30M reminder já foi enviado')
    }
  }

  console.log('\n\n📊 Status da fila:')
  const jobCounts = await remindersQueue.getJobCounts()
  console.log(jobCounts)

  console.log('\n✅ Concluído!')
  await app.close()
}

main().catch((err) => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
