-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'FINISHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AppointmentAction" AS ENUM ('CREATE', 'RESCHEDULE', 'CANCEL');

-- CreateTable
CREATE TABLE "appointment_history" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "changed_field" "AppointmentAction" NOT NULL,
    "previous_start_date_time" TEXT,
    "new_start_date_time" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "current_flow" TEXT NOT NULL,
    "current_step" TEXT NOT NULL,
    "context_data" JSONB NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "last_interaction_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intent_log" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "client_message" TEXT NOT NULL,
    "extracted_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intent_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointment_history" ADD CONSTRAINT "appointment_history_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intent_log" ADD CONSTRAINT "intent_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
