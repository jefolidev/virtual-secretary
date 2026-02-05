-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "google_event_id" TEXT NOT NULL,
    "google_event_link" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "start_date_time" TIMESTAMP(3) NOT NULL,
    "end_date_time" TIMESTAMP(3) NOT NULL,
    "sync_status" TEXT NOT NULL DEFAULT 'SYNCED',
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_events_appointment_id_key" ON "calendar_events"("appointment_id");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
