-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "pendingEvaluationId" TEXT;

-- CreateTable
CREATE TABLE "pending_evaluations" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_evaluations_appointment_id_key" ON "pending_evaluations"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_evaluations_whatsapp_number_key" ON "pending_evaluations"("whatsapp_number");
