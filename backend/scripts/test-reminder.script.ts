import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { getQueueToken } from '@nestjs/bullmq'
import { NestFactory } from '@nestjs/core'
import { Queue } from 'bullmq'
import { randomUUID } from 'crypto'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const prisma = app.get(PrismaService)
  const remindersQueue = app.get<Queue>(getQueueToken('whatsapp-reminders'))

  // 1. Check queue connection
  console.log('📡 Queue name:', remindersQueue.name)
  const jobCounts = await remindersQueue.getJobCounts()
  console.log('📊 Current queue state:', jobCounts)

  const testUser = await prisma.user.findFirst({
    where: { whatsappNumber: '5585921853560' },
  })

  if (!testUser) {
    console.error(
      '[NOT FOUND] ❌ Test user with whatsapp number 5585921853560 not found.',
    )
    process.exit(1)
  }

  const testProfessionalUser = await prisma.user.findFirst({
    where: { id: '9639015d-6e29-487d-8bc6-1e8ab1470084' },
  })

  if (!testProfessionalUser) {
    console.error(
      '[NOT FOUND] ❌ Test professional user with id 9639015d-6e29-487d-8bc6-1e8ab1470084 not found.',
    )
    process.exit(1)
  }

  const CLIENT_ID = testUser.clientId

  if (!CLIENT_ID) {
    console.error(
      '[NOT FOUND] ❌ Test user does not have an associated client ID.',
    )
    process.exit(1)
  }

  const PROFESSIONAL_ID = testProfessionalUser.professionalId

  if (!PROFESSIONAL_ID) {
    console.error(
      '[NOT FOUND] ❌ Test user does not have an associated professional ID.',
    )
    process.exit(1)
  }

  console.log(`👤 Client: ${testUser.name} (${CLIENT_ID})`)
  console.log(
    `👨‍⚕️ Professional: ${testProfessionalUser.name} (${PROFESSIONAL_ID})`,
  )
  const appointmentId = randomUUID()
  const startDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 1000)
  const endDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 70 * 1000)

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

  // 2. Enqueue and log the returned job
  const job = await remindersQueue.add(
    'send-24h-reminder',
    { appointmentId },
    { delay: 10_000 },
  )
  console.log(`✅ Job added - id: ${job.id}, name: ${job.name}`)

  // 3. Check queue state after enqueue
  const jobCountsAfter = await remindersQueue.getJobCounts()
  console.log('📊 Queue state after enqueue:', jobCountsAfter)

  // 4. Verify the job is actually in the queue
  const delayedJobs = await remindersQueue.getDelayed()
  console.log(`📋 Delayed jobs in queue: ${delayedJobs.length}`)
  delayedJobs.forEach((j) =>
    console.log(`   - [${j.id}] ${j.name} data:`, j.data),
  )

  console.log('\n⏳ Waiting 30s then checking if job was picked up...\n')
  await new Promise((r) => setTimeout(r, 30_000))

  // 5. Check if job was processed or failed
  const jobState = await job.getState()
  console.log(`📌 Job state after 30s: ${jobState}`)

  if (jobState === 'failed') {
    const failedReason = job.failedReason
    console.log('❌ Job failed with reason:', failedReason)
  }

  const failedJobs = await remindersQueue.getFailed()
  if (failedJobs.length > 0) {
    console.log('\n❌ Failed jobs found:')
    failedJobs.forEach((j) =>
      console.log(`   - [${j.id}] ${j.name} reason: ${j.failedReason}`),
    )
  }

  // 6. Check DB for reminder
  const reminders = await prisma.appointmentReminder.findMany({
    where: { appointmentId },
  })
  console.log(`\n📝 Reminders in DB: ${reminders.length}`)
  reminders.forEach((r) => console.log(`   [${r.type}] sentAt: ${r.sentAt}`))

  // const timeout = Date.now() + 5 * 60 * 1000
  // while (Date.now() < timeout) {
  //   await new Promise((r) => setTimeout(r, 10_000))

  //   const reminders = await prisma.appointmentReminder.findMany({
  //     where: { appointmentId },
  //   })

  //   if (reminders.length > 0) {
  //     console.log('✅ Reminder processed and saved in DB:')
  //     reminders.forEach((r) => console.log(`  [${r.type}] sentAt: ${r.sentAt}`))
  //     console.log('\n⏳ Waiting 10 seconds before cleanup...')
  //     await new Promise((r) => setTimeout(r, 10_000))

  //     await prisma.appointmentReminder.deleteMany({ where: { appointmentId } })
  //     await prisma.appointment.delete({ where: { id: appointmentId } })
  //     // await prisma.client.delete({ where: { id: CLIENT_ID } })
  //     await prisma.professional.delete({ where: { id: PROFESSIONAL_ID } })
  //     await prisma.user.delete({
  //       where: { id: testProfessionalUser.id },
  //     })

  //     console.log('🧹 Cleanup done')
  //     await app.close()
  //     return
  //   }

  //   console.log(`  Still waiting... (${new Date().toISOString()})`)
  // }

  // // 5 minutes passed with no reminder - cleanup anyway
  // console.log('❌ No reminder after 5 minutes, cleaning up...')
  // await prisma.appointmentReminder.deleteMany({ where: { appointmentId } })
  // await prisma.appointment.delete({ where: { id: appointmentId } })
  // await prisma.client.delete({ where: { id: CLIENT_ID } })
  // await prisma.professional.delete({ where: { id: PROFESSIONAL_ID } })
  // await prisma.user.delete({
  // where: { id: testProfessionalUser.id },
  // })
  // console.log('🧹 Cleanup done')
  await app.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
