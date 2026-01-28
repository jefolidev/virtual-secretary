import z from 'zod'

export const fetchProfessionalSchedulesSchema = z.array(
  z.object({
    professional_id: z.uuid(),
    client_id: z.uuid(),
    schedule_time: z.object({
      start_hour: z.string(),
      end_hour: z.string(),
    }),
    modality: z.string(),
    reschedule_time: z
      .object({
        start_hour: z.string().optional(),
        end_hour: z.string().optional(),
      })
      .optional(),
    agreed_price: z.number(),
    google_meet_link: z.string().url().optional(),
    status: z.string(),
    started_at: z.string().nullable(),
    total_elapsed_ms: z.number().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
)

export type FetchProfessionalSchedulesSchema = z.infer<
  typeof fetchProfessionalSchedulesSchema
>
