// scripts/test-reminder.script.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { randomUUID } from 'crypto'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const prisma = app.get(PrismaService)

  // Use real IDs that exist in your DB
  const CLIENT_ID = 'your-client-id'
  const PROFESSIONAL_ID = 'your-professional-id'

  const appointmentId = randomUUID()

  // Set startDateTime to 31 minutes from now so the 30m reminder fires in ~1 min
  const startDateTime = new Date(Date.now() + 31 * 60 * 1000)
  const endDateTime = new Date(Date.now() + 91 * 60 * 1000)

  await prisma.appointment.create({
    data: {
      id: appointmentId,
      clientId: CLIENT_ID,
      professionalId: PROFESSIONAL_ID,
      startDateTime,
      endDateTime,
      modality: 'ONLINE',
      agreedPrice: 100,
      status: 'SCHEDULED',
      paymentStatus: 'PENDING',
      syncWithGoogleCalendar: false,
    },
  })

  console.log(`✅ Appointment created: ${appointmentId}`)
  console.log(`⏰ startDateTime: ${startDateTime.toISOString()}`)
  console.log('⏳ Waiting 2 minutes for the 30m reminder worker to fire...\n')

  // Poll the DB every 10s for up to 2 minutes
  const timeout = Date.now() + 2 * 60 * 1000
  while (Date.now() < timeout) {
    await new Promise((r) => setTimeout(r, 10_000))

    const reminders = await prisma.appointmentReminder.findMany({
      where: { appointmentId },
    })

    if (reminders.length > 0) {
      console.log('✅ Reminders found in DB:')
      reminders.forEach((r) =>
        console.log(`  [${r.type}] sentAt: ${r.sentAt}`),
      )
      break
    } else {
      console.log(`  Still waiting... (${new Date().toISOString()})`)
    }
  }

  // Cleanup
  await prisma.appointmentReminder.deleteMany({ where: { appointmentId } })
  await prisma.appointment.delete({ where: { id: appointmentId } })
  console.log('\n🧹 Cleanup done')

  await app.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})