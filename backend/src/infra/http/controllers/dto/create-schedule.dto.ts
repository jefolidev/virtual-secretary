import { z } from 'zod'

export const createScheduleBodySchema = z.object({
  professionalId: z.uuid('Please provide a professional.'),
  modality: z.enum(
    ['IN_PERSON', 'ONLINE'],
    'Please provide the schedule modality.'
  ),
  startDateTime: z.coerce.date(),
})

export type CreateScheduleBodySchema = z.infer<typeof createScheduleBodySchema>
